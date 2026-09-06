#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"

#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

namespace quantpulse::infrastructure::market_data
{

    namespace
    {

        std::vector<std::string> splitCsvLine(
            const std::string &line)
        {
            std::vector<std::string> fields;

            std::stringstream stream(line);
            std::string field;

            while (std::getline(stream, field, ','))
            {
                fields.push_back(field);
            }

            return fields;
        }

        std::int64_t parseTimestamp(
            const std::string &value,
            std::size_t lineNumber)
        {
            try
            {
                std::size_t processed = 0;

                const auto result =
                    std::stoll(value, &processed);

                if (processed != value.size())
                {
                    throw std::invalid_argument(
                        "trailing characters");
                }

                return result;
            }
            catch (const std::exception &)
            {
                throw std::invalid_argument(
                    "Invalid timestamp at CSV line " +
                    std::to_string(lineNumber));
            }
        }

        double parseDouble(
            const std::string &value,
            const std::string &fieldName,
            std::size_t lineNumber)
        {
            try
            {
                std::size_t processed = 0;

                const double result =
                    std::stod(value, &processed);

                if (processed != value.size())
                {
                    throw std::invalid_argument(
                        "trailing characters");
                }

                return result;
            }
            catch (const std::exception &)
            {
                throw std::invalid_argument(
                    "Invalid " +
                    fieldName +
                    " at CSV line " +
                    std::to_string(lineNumber));
            }
        }

    } // namespace

    MarketDataset CsvMarketDataReader::read(
        const std::string &filePath)
    {
        std::ifstream file(filePath);

        if (!file.is_open())
        {
            throw std::runtime_error(
                "Unable to open market data file: " +
                filePath);
        }

        std::string line;

        if (!std::getline(file, line))
        {
            throw std::invalid_argument(
                "Market data CSV is empty");
        }

        const auto header = splitCsvLine(line);

        if (header.size() != 7 ||
            header[0] != "timestamp" ||
            header[1] != "symbol" ||
            header[2] != "open" ||
            header[3] != "high" ||
            header[4] != "low" ||
            header[5] != "close" ||
            header[6] != "volume")
        {
            throw std::invalid_argument(
                "Unsupported market bar CSV schema");
        }

        std::vector<
            quantpulse::domain::market_data::MarketObservation>
            observations;

        std::string datasetSymbol;

        quantpulse::domain::market_data::MarketDataEngine validator;

        std::size_t lineNumber = 1;

        while (std::getline(file, line))
        {
            ++lineNumber;

            if (line.empty())
            {
                continue;
            }

            const auto fields = splitCsvLine(line);

            if (fields.size() != 7)
            {
                throw std::invalid_argument(
                    "Expected 7 fields at CSV line " +
                    std::to_string(lineNumber));
            }

            const std::string &symbol = fields[1];

            if (symbol.empty())
            {
                throw std::invalid_argument(
                    "Symbol cannot be empty at CSV line " +
                    std::to_string(lineNumber));
            }

            if (datasetSymbol.empty())
            {
                datasetSymbol = symbol;
            }
            else if (symbol != datasetSymbol)
            {
                throw std::invalid_argument(
                    "Multiple symbols are not supported "
                    "in one dataset");
            }

            const auto timestamp =
                parseTimestamp(
                    fields[0],
                    lineNumber);

            const double open =
                parseDouble(
                    fields[2],
                    "open",
                    lineNumber);

            const double high =
                parseDouble(
                    fields[3],
                    "high",
                    lineNumber);

            const double low =
                parseDouble(
                    fields[4],
                    "low",
                    lineNumber);

            const double close =
                parseDouble(
                    fields[5],
                    "close",
                    lineNumber);

            const double volume =
                parseDouble(
                    fields[6],
                    "volume",
                    lineNumber);

            if (open <= 0.0 ||
                high <= 0.0 ||
                low <= 0.0 ||
                close <= 0.0)
            {
                throw std::invalid_argument(
                    "Prices must be positive at CSV line " +
                    std::to_string(lineNumber));
            }

            if (high < low ||
                high < open ||
                high < close ||
                low > open ||
                low > close)
            {
                throw std::invalid_argument(
                    "Invalid OHLC relationship at CSV line " +
                    std::to_string(lineNumber));
            }

            if (volume < 0.0)
            {
                throw std::invalid_argument(
                    "Volume cannot be negative at CSV line " +
                    std::to_string(lineNumber));
            }

            quantpulse::domain::market_data::MarketObservation observation{
                .timestamp = timestamp,
                .price = close,
                .bid = 0.0,
                .ask = 0.0,
                .volume = volume};

            validator.update(observation);

            observations.push_back(observation);
        }

        if (observations.empty())
        {
            throw std::invalid_argument(
                "Market data CSV contains no observations");
        }

        return MarketDataset{
            .symbol = datasetSymbol,
            .observations = std::move(observations)};
    }

} // namespace quantpulse::infrastructure::market_data