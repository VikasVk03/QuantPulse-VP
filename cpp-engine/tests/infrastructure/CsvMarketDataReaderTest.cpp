#include "quantpulse/infrastructure/market_data/CsvMarketDataReader.hpp"

#include <gtest/gtest.h>

#include <chrono>
#include <filesystem>
#include <fstream>
#include <string>

namespace
{

    using quantpulse::infrastructure::market_data::
        CsvMarketDataReader;

    class CsvMarketDataReaderTest : public ::testing::Test
    {
    protected:
        std::filesystem::path writeCsv(
            const std::string &content)
        {
            const auto path =
                std::filesystem::temp_directory_path() /
                ("quantpulse-market-bar-" +
                 std::to_string(
                     std::chrono::steady_clock::now()
                         .time_since_epoch()
                         .count()) +
                 ".csv");

            std::ofstream file(path, std::ios::binary);
            file << content;
            file.close();
            paths_.push_back(path);
            return path;
        }

        void TearDown() override
        {
            for (const auto &path : paths_)
            {
                std::filesystem::remove(path);
            }
        }

        std::vector<std::filesystem::path> paths_;
    };

    constexpr const char *header =
        "timestamp,symbol,open,high,low,close,volume\n";

    std::string row(
        const std::string &values)
    {
        return std::string(header) + values + "\n";
    }

    TEST_F(CsvMarketDataReaderTest, ReadsValidOhlcvRow)
    {
        const auto dataset = CsvMarketDataReader::read(
            writeCsv(row("1,RELIANCE,100,105,99,103,1000")).string());

        ASSERT_EQ(dataset.symbol, "RELIANCE");
        ASSERT_EQ(dataset.bars.size(), 1);
        EXPECT_EQ(dataset.bars[0].timestamp, 1);
        EXPECT_EQ(dataset.bars[0].symbol, "RELIANCE");
        EXPECT_DOUBLE_EQ(dataset.bars[0].open, 100.0);
        EXPECT_DOUBLE_EQ(dataset.bars[0].high, 105.0);
        EXPECT_DOUBLE_EQ(dataset.bars[0].low, 99.0);
        EXPECT_DOUBLE_EQ(dataset.bars[0].close, 103.0);
        EXPECT_DOUBLE_EQ(dataset.bars[0].volume, 1000.0);
    }

    TEST_F(CsvMarketDataReaderTest, ReadsCrLfInput)
    {
        const auto dataset = CsvMarketDataReader::read(
            writeCsv("timestamp,symbol,open,high,low,close,volume\r\n"
                     "1,RELIANCE,100,105,99,103,1000\r\n")
                .string());

        ASSERT_EQ(dataset.bars.size(), 1);
        EXPECT_DOUBLE_EQ(dataset.bars[0].close, 103.0);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsEmptyCsv)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(writeCsv("").string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsMalformedNumericField)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,invalid,105,99,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsInvalidOpen)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,0,105,99,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsInvalidHigh)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,0,99,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsInvalidLow)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,105,0,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsInvalidClose)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,105,99,0,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsNegativeVolume)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,105,99,103,-1")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsHighBelowOpen)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,106,105,99,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsLowAboveClose)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,105,104,103,1000")).string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsMixedSymbols)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("1,RELIANCE,100,105,99,103,1000") +
                         "2,TCS,103,106,102,105,1100\n")
                    .string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsNonIncreasingTimestamps)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(row("2,RELIANCE,100,105,99,103,1000") +
                         "1,RELIANCE,103,106,102,105,1100\n")
                    .string()),
            std::invalid_argument);
    }

    TEST_F(CsvMarketDataReaderTest, RejectsEmptyDataRow)
    {
        EXPECT_THROW(
            CsvMarketDataReader::read(
                writeCsv(std::string(header) + "\n").string()),
            std::invalid_argument);
    }

} // namespace
