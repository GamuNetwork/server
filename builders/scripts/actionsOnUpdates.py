import subprocess
import os
import re
import sys


PYTHON = sys.executable
NODEJS = ""
NPM = ""

if os.name == "nt": # Windows
    NODEJS = '"'+subprocess.check_output(["where", "node"]).decode().strip().split("\n")[0]+'"' # Get the first nodejs path
    NPM = '"'+subprocess.check_output(["where", "npm"]).decode().strip().split("\n")[0]+'"' # Get the first npm path
else: # Linux
    NODEJS = subprocess.check_output(["which", "node"]).decode().strip()
    NPM = subprocess.check_output(["which", "npm"]).decode().strip()

"""
Functions for updating project files (such as node modules) when they are changed
Look for ./package.json and update node modules
""" 
def updateNodeModules(file):
    print("Updating node modules")
    subprocess.check_call(NPM + " install", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Node modules updated")


"""
Functions for updating builders modules when they are changed
Look for ./builders/requirements.txt and update builders modules
"""
def updateBuildersModules(file):
    print("Updating builders modules")
    subprocess.check_call([PYTHON, "-m", "pip", "install", "-r", file], shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("Builders modules updated")


"""
Dict containing the patterns and the functions to run when a file is updated
"""
ACTIONSONUPDATES = {
    r"package\.json": updateNodeModules,
    r"builders\\requirements\.txt": updateBuildersModules
}