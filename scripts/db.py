import env
import os


def parseDbUrl(url: str) -> dict:
	hostStartIdx = url.index("@") + 1
	hostEndIdx = url[hostStartIdx : ].index("/")
	host = url[hostStartIdx : hostStartIdx + hostEndIdx]

	userStartIdx = url.index("mysql://") + 8
	userEndIdx = url[userStartIdx:].index(":")
	user = url[userStartIdx : userStartIdx + userEndIdx]

	passwordStartIdx = userStartIdx + userEndIdx + 1
	passwordEndIdx = hostStartIdx - 1
	password = url[passwordStartIdx : passwordEndIdx]

	reconnect = url.find("reconnect=true") != -1

	nameStartIdx = hostStartIdx + hostEndIdx + 1
	if reconnect:
	    nameEndIdx = url.index("?")
	else:
	    nameEndIdx = len(url)
	name = url[nameStartIdx : nameEndIdx]

	return {
		"host":      host,
		"user":      user,
		"password":  password,
		"reconnect": reconnect,
		"name":      name
	}


def main() -> None:
	envars = env.getEnv(".env")
	args = parseDbUrl(envars["DATABASE_URL"])

	cmd = f"mysql --host={args['host']} --user={args['user']} --password={args['password']}"
	if args["reconnect"]:
		cmd += " --reconnect"
	cmd += f" {args['name']}"

	os.system(cmd)


if __name__ == "__main__":
	main()
