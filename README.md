# ayr
A toy array language that draws inspiration by J, APL, and K. My goal for the project is to take the best/most useful features of each of these languages while maintaining a clean and understandable language. As it is still a work in progress, any suggestions are welcome.

The only thing I will most likely never bring over in any regard is K's dictionarys. They are well suited for what K is intended to be, but I do not feel like I should take the time to implement them, as it would require a lot of changes to the codebase. Besides this, if there is a program that is difficult to translate from a different array language, or one that is exceptionally verbose when translated, I would be happy to implement new features to match this missing functionality.

While it is not intended to be exclusively for code golfing, ayr generally has much shorter programs than its counterparts, making it well suited for this.

## Installation
```
npm i -g ayr-lang
```

Once installed, run
```
ayr help
```
to get a list of commands.

## Usage
A full guide can be found in the [specs](specs/README.md). For some example comparisons between different languages and **ayr**, see [here](comparisons/README.md). If there are any comparisons you would like to contribute, feel free to leave a PR.

JavaScript can be annoying to read from STDIN with on occasion, so I have for now made "STDIN" be read through argv. I will update this in the future once I get around to it.

Some quick example programs/excerpts:

### Hello World
```
'Hello, World!'
```
### Game of Life Iteration [see here](comparisons/gol.apl)
```
#&~.;.3 3,:":3+0,":
```
### Cat Program
```
I
```

### [Torian](https://googology.wikia.org/wiki/Torian)
```
:*/,~$:`
```