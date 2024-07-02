from builderTool import BaseBuilder

class Builder(BaseBuilder):
    def Setup(self):
        self.addDirectory("modules")
        self.addDirectory("config")
        self.addDirectory("discordbot")
        self.addFile("package-lock.json")
        self.addFile("package.json")
        self.addFile("start.mjs")
        
        self.runCommand("npm ci")
        
    def Tests(self):
        self.addDirectory("tests")
        self.runCommand("npm run test")
        
        
BaseBuilder.execute()