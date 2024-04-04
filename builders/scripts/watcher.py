from actionsOnUpdates import ACTIONSONUPDATES
from autoUpdate import Watcher

def main():
    watcher = Watcher(".")
    watcher.addCommands(ACTIONSONUPDATES)
    watcher.start()
    
if __name__ == "__main__":
    main()