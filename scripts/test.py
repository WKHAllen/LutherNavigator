import os
import sys

import env


def main() -> None:
    """Process the command line arguments."""

    # Load the environment variables
    env.load_env(".env")

    # Get the arguments
    args = sys.argv[2:]

    # Optionally specified `emulation-mode` argument MUST BE THE LAST in the
    # argument list. If the emulation mode is on, in addition to the basic UI
    # tests using three major web engines, mobile emulation tests on a variety
    # of devices will also run. Since the emulation can take quite a bit of
    # time, the `emulation-mode` argument is made optional.
    if args and args[-1] == "--emulation-mode":
        os.system(
            f"npx jest --runInBand {' '.join(args[:-1])}"
        )
        os.system("npx jest-coverage-badges")
        os.system("npx ts-node test/ui/uitest.ts")
        os.system("npx ts-node test/ui/mobile_emulation.ts")
    else:
        os.system(
            f"npx jest --runInBand {' '.join(args)}"
        )
        os.system("npx jest-coverage-badges")
        os.system("npx ts-node test/ui/uitest.ts")


if __name__ == "__main__":
    main()
