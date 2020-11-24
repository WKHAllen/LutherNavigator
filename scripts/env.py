import os


def loadEnv(filename: str) -> None:
	with open(filename, "r") as f:
		for line in f:
			line = line.strip()
			eqIdx = line.find("=")

			if eqIdx != -1:
				key = line[ : eqIdx]
				value = line[eqIdx + 1 : ]
				os.environ[key] = value


def getEnv(filename: str) -> dict:
	env = {}

	with open(filename, "r") as f:
		for line in f:
			line = line.strip()
			eqIdx = line.find("=")

			if eqIdx != -1:
				key = line[ : eqIdx]
				value = line[eqIdx + 1 : ]
				env[key] = value

	return env
