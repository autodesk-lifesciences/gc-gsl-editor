#!/bin/bash

# Script used only by the Dockerfile, for other purposes run 'npm run install-fsharp'

if which mono >/dev/null; then
    echo "Found a valid mono installation required by the GSL server."
    exit 0
fi

echo ""
echo "Preparing to install mono"
echo "-------------------------"
echo ""

if [[ ("$OSTYPE" == "linux-gnu") ||  ("$OSTYPE" == "cygwin") ]]; then

    set -x
    sudo add-apt-repository ppa:ubuntu-toolchain-r/test -y
    #sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
    #echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list
    #echo "deb http://download.mono-project.com/repo/debian wheezy-libtiff-compat main" | sudo tee -a /etc/apt/sources.list.d/mono-xamarin.list

    sudo apt-get update -y
    sudo apt-get install mono-devel -yf
    sudo apt-get install ca-certificates-mono -yf
    sudo apt-get install mono-complete -yf
    sudo apt-get install fsharp -yf
    set +x
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if which brew >/dev/null; then
        set -x
        brew install mono
        set +x
    else
        echo "****************************************************"
        echo "              Action Required! "
        echo ""
        echo "We could not detect 'Homebrew' installed on your " 
        echo "system. Please refer to http://fsharp.org/use/mac/ "
        echo "and follow the instructions given to manually "
        echo "install mono."
        echo ""
        echo "****************************************************"
    fi
else
    echo "ERROR: Could not determine mono installation instructions for OS of type " $OSTYPE ". Please check http://fsharp.org/."
fi
