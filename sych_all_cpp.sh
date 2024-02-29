#!/bin/sh

ls .. | grep "^game" | awk '{print "sh", "sych_cpp_submodule.sh", substr($0, 6, 3)}' | sh
