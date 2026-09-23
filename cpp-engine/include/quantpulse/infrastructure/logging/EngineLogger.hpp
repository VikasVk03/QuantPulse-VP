#pragma once

#include <chrono>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <string_view>

namespace quantpulse::infrastructure::logging
{

enum class LogLevel
{
    Debug,
    Info,
    Warn,
    Error
};

class EngineLogger
{
public:
    static void log(LogLevel level, std::string_view tag, std::string_view message)
    {
        const auto now = std::chrono::system_clock::now();
        const auto in_time_t = std::chrono::system_clock::to_time_t(now);
        const auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
                            now.time_since_epoch()) %
                        1000;

        std::tm time_info{};
#if defined(_WIN32) || defined(_WIN64)
        localtime_s(&time_info, &in_time_t);
#else
        localtime_r(&in_time_t, &time_info);
#endif

        std::ostringstream ss;
        ss << std::put_time(&time_info, "%Y-%m-%d %H:%M:%S")
           << '.' << std::setfill('0') << std::setw(3) << ms.count();

        std::string_view levelStr = "INFO";
        switch (level)
        {
        case LogLevel::Debug:
            levelStr = "DEBUG";
            break;
        case LogLevel::Info:
            levelStr = "INFO";
            break;
        case LogLevel::Warn:
            levelStr = "WARN";
            break;
        case LogLevel::Error:
            levelStr = "ERROR";
            break;
        }

        std::clog << "[" << ss.str() << "] [CPP-ENGINE:" << levelStr << "] [" << tag << "] "
                  << message << std::endl;
    }

    static void debug(std::string_view tag, std::string_view message)
    {
        log(LogLevel::Debug, tag, message);
    }

    static void info(std::string_view tag, std::string_view message)
    {
        log(LogLevel::Info, tag, message);
    }

    static void warn(std::string_view tag, std::string_view message)
    {
        log(LogLevel::Warn, tag, message);
    }

    static void error(std::string_view tag, std::string_view message)
    {
        log(LogLevel::Error, tag, message);
    }
};

} // namespace quantpulse::infrastructure::logging
