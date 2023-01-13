default: all

test:
	cd tests && npm test
cicd:
	cd tests && npm run cicd

.PHONY: all
all: $(TARGET)
