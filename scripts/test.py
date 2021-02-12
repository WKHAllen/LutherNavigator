import os
import sys

import env


def main():
    env.load_env(".env")
    args = " ".join(sys.argv[2:])
    os.system(f"npx jest {args} --coverage --coverageReporters='json-summary'")
    os.system("npx jest-coverage-badges")
    os.system("npx ts-node uitest/uitest.ts")


if __name__ == "__main__":
    main()
