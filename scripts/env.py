import os


def load_env(filename: str) -> None:
    with open(filename, "r") as f:
        for line in f:
            line = line.strip()
            eq_idx = line.find("=")

            if eq_idx != -1:
                key = line[:eq_idx]
                value = line[eq_idx + 1 :]
                os.environ[key] = value


def get_env(filename: str) -> dict:
    env = {}

    with open(filename, "r") as f:
        for line in f:
            line = line.strip()
            eq_idx = line.find("=")

            if eq_idx != -1:
                key = line[:eq_idx]
                value = line[eq_idx + 1 :]
                env[key] = value

    return env
