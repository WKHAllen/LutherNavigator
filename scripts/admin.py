import sys

import mysql.connector

import env
import db

from typing import Any, List


ADMIN_FIELDS = ["id", "firstname", "lastname", "email"]


def get_conn() -> Any:
    envars = env.get_env(".env")
    args = db.parse_db_url(envars["DATABASE_URL"])

    the_db = mysql.connector.connect(
        host=args["host"],
        user=args["user"],
        password=args["password"],
        database=args["name"],
    )
    return the_db


def add_admin(email: str) -> str:
    conn = get_conn()
    cur = conn.cursor()

    err = ""

    cur.execute(f"SELECT id FROM User WHERE email = '{email}';")
    res = cur.fetchall()
    if len(res) == 0:
        err = "a user with the specified email does not exist"
    else:
        cur.execute(f"SELECT id FROM User WHERE email = '{email}' AND admin = FALSE;")
        res = cur.fetchall()
        if len(res) == 0:
            err = "the user is already an admin"
        else:
            cur.execute(f"UPDATE User SET admin = TRUE WHERE email = '{email}';")
            conn.commit()

    cur.close()
    conn.close()

    return err


def remove_admin(email: str) -> str:
    conn = get_conn()
    cur = conn.cursor()

    err = ""

    cur.execute(f"SELECT id FROM User WHERE email = '{email}';")
    res = cur.fetchall()
    if len(res) == 0:
        err = "a user with the specified email does not exist"
    else:
        cur.execute(f"SELECT id FROM User WHERE email = '{email}' AND admin = TRUE;")
        res = cur.fetchall()
        if len(res) == 0:
            err = "the user is not an admin"
        else:
            cur.execute(f"UPDATE User SET admin = FALSE WHERE email = '{email}';")
            conn.commit()

    cur.close()
    conn.close()

    return err


def list_admins() -> List[str]:
    conn = get_conn()
    cur = conn.cursor()

    err = ""

    cur.execute(f"SELECT {', '.join(ADMIN_FIELDS)} FROM User WHERE admin = TRUE;")
    res = cur.fetchall()

    cur.close()
    conn.close()

    return res


def max_length(list: List[Any], index: int) -> int:
    maxlen = 0

    for item in list:
        if len(item[index]) > maxlen:
            maxlen = len(item[index])

    return maxlen


def display_admins(admins: List[Any]) -> None:
    maxlens = { ADMIN_FIELDS[i]: max(max_length(admins, i), len(ADMIN_FIELDS[i])) for i in range(len(ADMIN_FIELDS)) }

    print("   ".join([field.ljust(maxlens[field]) for field in ADMIN_FIELDS]))
    print("-" * (sum(list(maxlens.values())) + (3 * (len(maxlens) - 1))))

    for admin in admins:
        admin_fields = { ADMIN_FIELDS[i]: admin[i] for i in range(len(ADMIN_FIELDS)) }
        print("   ".join([admin_fields[field].ljust(maxlens[field]) for field in ADMIN_FIELDS]))


def main() -> None:
    args = sys.argv[2:]
    if not ((len(args) == 1 and args[0] == "list") or (len(args) == 2 and args[0] in ("add", "remove"))):
        print(f"Usage: {sys.argv[1].strip()} <add | remove | list> [user email]")
        sys.exit(1)

    if args[0] == "add":
        err = add_admin(args[1])
        if err != "":
            print(f"Error: {err}")
        else:
            print("Added user as an admin")
    elif args[0] == "remove":
        err = remove_admin(args[1])
        if err != "":
            print(f"Error: {err}")
        else:
            print("Removed user's admin status")
    elif args[0] == "list":
        admins = list_admins()
        display_admins(admins)


if __name__ == "__main__":
    main()
