import os
import sys

import env


def main():
    env.load_env(".env")
    args = " ".join(sys.argv[2:])
    os.system(f"npx jest {args} --coverage --coverageReporters='json-summary' --runInBand")
    os.system("npx jest-coverage-badges")
    os.system("npx ts-node test/ui/uitest.ts")


if __name__ == "__main__":
    main()
