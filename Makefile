default: all

test:
	cd tests && npm test
cicd:
	cd tests && npm run cicd
build:
	npm i minify -g && minify lib/wrender.js > lib/wrender.min.js

.PHONY: all
all: $(TARGET)
