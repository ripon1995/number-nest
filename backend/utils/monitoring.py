from pymongo import monitoring


class CommandLogger(monitoring.CommandListener):
    def started(self, event):
        # Using print ensures it bypasses the logging filters entirely
        print("\n" + "=" * 50)
        print(f"DEBUG: MONGO COMMAND STARTED")
        print(f"Command: {event.command_name}")
        print(f"Query:   {event.command}")
        print("=" * 50 + "\n")

    def succeeded(self, event):
        print(f"DEBUG: MONGO SUCCESS ({event.duration_micros / 1000:.2f}ms)")

    def failed(self, event):
        print(f"DEBUG: MONGO FAILED: {event.failure}")


def register_mongo_monitoring():
    monitoring.register(CommandLogger())
