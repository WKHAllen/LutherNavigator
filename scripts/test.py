import os

import env


def main():
    env.load_env(".env")
    os.system("npx jest")


if __name__ == "__main__":
    main()
