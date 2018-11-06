# An example of returning an image as a result.
# We will load the JSON from existing file and return that

import json
import sys


# The contents of an image 
# is stored in "image-example.json", where
# the image is already stored as a base64 stream.
# Copy the contents to the output file.

# Yes, we could do this as a bash/shell script,
# but that would require tinkering with the permissions.

data = open("./scripts/image-example.json", "r").read()
with open(sys.argv[1], 'w') as f:
    f.write(data)
