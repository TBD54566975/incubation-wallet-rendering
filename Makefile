default: all

test:
	cd tests && npm test

.PHONY: all
all: $(TARGET)
