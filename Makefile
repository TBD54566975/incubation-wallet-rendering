default: all

test:
	cd tests && npm test
cicd:
	cd tests && npm run cicd
build:
	npm i minify -g && minify lib/walletrendering.js > lib/walletrendering.min.js

.PHONY: all
all: $(TARGET)
