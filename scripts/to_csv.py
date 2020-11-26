import env
import db
import sys
import os
import csv
import mysql.connector
from typing import List


def get_columns(cur, table: str) -> List[str]:
    cur.execute(f"SHOW COLUMNS FROM {table};")
    columns = [column[0] for column in cur]
    return columns


def save_table(outfile: str, table: str, fields: List[str] = None) -> None:
    envars = env.get_env(".env")
    args = db.parse_db_url(envars["DATABASE_URL"])

    the_db = mysql.connector.connect(
        host=args["host"],
        user=args["user"],
        password=args["password"],
        database=args["name"],
    )
    cur = the_db.cursor()

    if not fields:
        field_str = "*"
    else:
        field_str = ", ".join(fields)

    columns = get_columns(cur, table)
    cur.execute(f"SELECT {field_str} FROM {table};")

    with open(outfile, "w", newline="") as csvfile:
        csv_writer = csv.writer(csvfile, dialect="excel")
        csv_writer.writerow(columns)
        csv_writer.writerows(cur)

    cur.close()
    the_db.close()


def main():
    args = sys.argv[2:]
    if len(args) < 2:
        print(
            f"usage: {sys.argv[1].strip()} <output path> <table name> [table fields ...]"
        )
        sys.exit(1)

    outfile = args[0]
    if os.path.splitext(outfile)[1] == "":
        outfile += ".csv"
    table = args[1]
    fields = args[2:]

    save_table(outfile, table, fields)


if __name__ == "__main__":
    main()
