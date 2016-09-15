#!/bin/bash

# Clone the repo if GSL directory does not exist
if [ ! -d 'GSL' ]; then 
	git clone https://github.com/rupalkhilari/GSL-build.git GSL
	cd GSL
# If the existing GSL directory is a git repo then update it
elif [ -d GSL/.git ]; then
	cd GSL
	git pull
# Else remove the existing GSL directory and reclone it.
else
	rm -rf GSL
	git clone https://github.com/rupalkhilari/GSL-build.git GSL
	cd GSL
fi
# Checkout the required branch
git checkout json_assembly_build