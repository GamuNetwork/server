import signal
import os
import re
import time
import threading
from typing import Callable

OLDPRINT = __builtins__["print"]

class Watcher:
    '''
    Whatch for changes  in any file in the path,  and execute the corresponding command
    '''
    def __init__(self, path):
        self.path = path
        self.commands = {}
        self.run = True
        self.thread : threading.Thread = None
        self.sleepTime = 1
        self.files = {}
        
        print("whatch for changes in", os.path.abspath(path))
        
    def populateFiles(self):
        for root, dirs, files in os.walk(self.path):
            for file in files:
                if root.startswith(".\\node_modules") or root.startswith(".\\builders\\env\\Lib\\site-packages"):
                    continue
                file = os.path.relpath(os.path.join(root, file), self.path)
                for pattern in self.commands:
                    if re.match(pattern, file):
                        self.files[file] = os.path.getmtime(file)
        
    def addCommand(self, pattern, command : Callable[[str], bool|None]):
        self.commands[pattern] = command
    
    def addCommands(self, commands : dict[str, Callable[[str], bool|None]]):
        self.commands.update(commands)
    
    def watch(self):
        while self.run:
            for file in self.files:
                if os.path.getmtime(file) != self.files[file]:
                    self.files[file] = os.path.getmtime(file)
                    for pattern in self.commands:
                        if re.match(pattern, file):
                            self.commands[pattern](file)
            time.sleep(self.sleepTime)
            
    def stop(self):
        self.run = False
        print("Stopping")
        if self.thread:
            self.thread.join()
            
    def signalHandler(self, sig, frame):
        self.stop()
        
    def consoleCommand(self):
        def _print(*args, writeCmd = True, **kwargs):
            if self.run:
                OLDPRINT("\r", end="", flush=True)
                OLDPRINT(*args, **kwargs)
                if writeCmd:
                    OLDPRINT("\033[32mAU\033[0m " + os.getcwd() + "> ", end="", flush=True)
            else:
                OLDPRINT(*args, **kwargs)
                
        __builtins__["print"] = _print
        while self.run:
            try:
                command = input("\033[32mAU\033[0m " + os.getcwd() + "> ")
            except Exception as e:
                continue
            match command:
                case "exit":
                    self.stop()
                case "help":
                    print("exit: exit the program", writeCmd=False)
                case "list":
                    for file in self.files:
                        print(file, writeCmd=False)
                case _:
                    print("Command not found")
        __builtins__["print"] = OLDPRINT
        
            
    def start(self, sleepTime = 1, console = True):
        self.sleepTime = sleepTime
        self.populateFiles()
        print(len(self.files) , "files found")
        
        signal.signal(signal.SIGINT, self.signalHandler)
        
        if console:
            self.th_start()
        else:
            self.normal_start()
    
    def normal_start(self):
        print("Press Ctrl + C to stop")
        self.watch()
    
    def th_start(self):
        self.thread = threading.Thread(target=self.watch)
        self.thread.start()
        print("enter 'exit' to stop the program, 'help' for help")
        self.consoleCommand()