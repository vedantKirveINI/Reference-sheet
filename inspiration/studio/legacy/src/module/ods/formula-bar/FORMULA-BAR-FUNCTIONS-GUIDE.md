# Arithmetic Functions

## average

**Definition:**  
Returns the average value for a set of numeric values within an array or when numeric values are entered individually.

**Arguments:**
- `value1` (required): The first number
- `value2` (optional): Additional numbers (you can include as many as needed)
- `...` (optional): More numbers separated by semicolons

**Returns:**  
A number representing the average of all provided values.

**Examples:**
```
average(10; 20; 30)
Result: 20

average(5; 10; 15; 20; 25)
Result: 15
```

**Use Case:** Calculate average test scores, monthly sales, or customer ratings.

---

## sum

**Definition:**  
Returns the sum of the values for a set of numeric values within an array or when numeric values are entered individually.

**Arguments:**
- `value1` (required): The first number to add
- `value2` (optional): Additional numbers to add (you can add as many as you want)
- `...` (optional): More numbers separated by semicolons

**Returns:**  
A single number that is the total of all the values added together.

**Examples:**
```
sum(10; 20; 30)
Result: 60

sum(5; 15; 25; 35)
Result: 80
```

**Use Case:** Calculate total sales for multiple products, add up expenses in a budget, or sum values from different data sources.

---

## min

**Definition:**  
Returns the smallest of the given numbers.

**Arguments:**
- `value1` (required): The first number to compare
- `value2` (optional): Additional numbers to compare
- `...` (optional): More numbers separated by semicolons

**Returns:**  
The smallest number from all the provided values.

**Examples:**
```
min(10; 20; 5; 30)
Result: 5

min(100; 50; 75; 200)
Result: 50
```

**Use Case:** Find the lowest price in a product list, identify the minimum temperature recorded, or determine the smallest test score.

---

## max

**Definition:**  
Returns the largest of the given numbers.

**Arguments:**
- `value1` (required): The first number to compare
- `value2` (optional): Additional numbers to compare
- `...` (optional): More numbers separated by semicolons

**Returns:**  
The largest number from all the provided values.

**Examples:**
```
max(10; 20; 5; 30)
Result: 30

max(100; 50; 75; 200)
Result: 200
```

**Use Case:** Find the highest price in a product list, identify the maximum temperature recorded, or determine the highest test score.

---

## floor

**Definition:**  
Returns the nearest integer multiple of significance that is less than or equal to the value. If no significance is provided, a significance of 1 is assumed.

**Arguments:**
- `value` (required): The number you want to round down
- `significance` (optional): The multiple to round down to. If not provided, defaults to 1 (rounds to nearest whole number)

**Returns:**  
A number rounded down to the nearest multiple of the significance value.

**Examples:**
```
floor(3.7)
Result: 3

floor(7.8; 2)
Result: 6
```

**Use Case:** Round prices down to nearest dollar, calculate quantities in batches, or determine minimum package sizes.

---

## ceiling

**Definition:**  
Returns the nearest integer multiple of significance that is greater than or equal to the value. If no significance is provided, a significance of 1 is assumed.

**Arguments:**
- `value` (required): The number you want to round up
- `significance` (optional): The multiple to round up to. If not provided, defaults to 1 (rounds to nearest whole number)

**Returns:**  
A number rounded up to the nearest multiple of the significance value.

**Examples:**
```
ceiling(3.2)
Result: 4

ceiling(7.3; 2)
Result: 8
```

**Use Case:** Round prices up to nearest dollar, calculate quantities in batches, or determine maximum package sizes needed.

---

## even

**Definition:**  
Returns the smallest even integer that is greater than or equal to the specified value.

**Arguments:**
- `value` (required): The number you want to round to the nearest even number

**Returns:**  
The smallest even number that is greater than or equal to the input value.

**Examples:**
```
even(3.2)
Result: 4

even(5)
Result: 6
```

**Use Case:** Round to even numbers for statistical purposes, calculate quantities that must be even, or round measurements to even values.

---

## odd

**Definition:**  
Rounds positive value up to the nearest odd number and negative value down to the nearest odd number.

**Arguments:**
- `value` (required): The number you want to round to the nearest odd number

**Returns:**  
The nearest odd number based on the input value.

**Examples:**
```
odd(3.2)
Result: 5

odd(4.1)
Result: 5
```

**Use Case:** Round to odd numbers for specific calculations, calculate quantities that must be odd, or round measurements to odd values.

---

## round

**Definition:**  
Rounds the value to the number of decimal places given by `precision`. Specifically, ROUND will round to the nearest integer at the specified precision, with ties broken by rounding half up toward positive infinity.

**Arguments:**
- `value` (required): The number you want to round
- `precision` (optional): The number of decimal places. If not provided, rounds to the nearest whole number (0 decimal places)

**Returns:**  
A rounded number with the specified precision.

**Examples:**
```
round(3.7)
Result: 4

round(3.14159; 2)
Result: 3.14
```

**Use Case:** Round currency values to 2 decimal places, round percentages for display, or simplify calculations by rounding to whole numbers.

---

## roundDown

**Definition:**  
Rounds the value to the number of decimal places given by `precision`, always rounding down, i.e., toward zero. You must give a value for the precision or the function will not work.

**Arguments:**
- `value` (required): The number you want to round down
- `precision` (optional): The number of decimal places. If not provided, rounds down to the nearest whole number

**Returns:**  
A number rounded down to the specified precision.

**Examples:**
```
roundDown(3.7)
Result: 3

roundDown(3.14159; 2)
Result: 3.14
```

**Use Case:** Calculate floor prices (always round down), determine minimum quantities, or calculate conservative estimates.

---

## roundUp

**Definition:**  
Rounds the value to the number of decimal places given by `precision`, always rounding up, i.e., away from zero. You must give a value for the precision or the function will not work.

**Arguments:**
- `value` (required): The number you want to round up
- `precision` (optional): The number of decimal places. If not provided, rounds up to the nearest whole number

**Returns:**  
A number rounded up to the specified precision.

**Examples:**
```
roundUp(3.1)
Result: 4

roundUp(3.14159; 2)
Result: 3.15
```

**Use Case:** Calculate ceiling prices (always round up), determine maximum quantities needed, or calculate conservative estimates (overestimate).

---

## count

**Definition:**  
Count the number of numeric items.

**Arguments:**
- `value1` (required): The first number to count
- `value2` (optional): Additional numbers to count
- `...` (optional): More numbers separated by semicolons

**Returns:**  
A number representing the count of numeric values provided.

**Examples:**
```
count(10; 20; 30)
Result: 3

count(5; 10; 15; 20; 25)
Result: 5
```

**Use Case:** Count how many numeric values you have, count items in a numeric list, or count completed transactions.

---

## countA

**Definition:**  
Count the number of all elements. This function counts both numeric and text values.

**Arguments:**
- `value1` (required): The first value to count (can be number or text)
- `value2` (optional): Additional values to count
- `...` (optional): More values separated by semicolons

**Returns:**  
A number representing the total count of all values (both numeric and text).

**Examples:**
```
countA(10; "apple"; 30; "banana")
Result: 4

countA("red"; "blue"; "green")
Result: 3
```

**Use Case:** Count total items in a mixed list (numbers and text), count all entries in a form, or count responses regardless of type.

---

## abs

**Definition:**  
Returns the absolute value.

**Arguments:**
- `value` (required): The number you want the absolute value of (can be positive or negative)

**Returns:**  
A positive number representing the absolute value.

**Examples:**
```
abs(-5)
Result: 5

abs(-10.5)
Result: 10.5
```

**Use Case:** Calculate distance (always positive), find the difference between two values, or calculate absolute change.

---

## sqrt

**Definition:**  
Returns the square root of a nonnegative number.

**Arguments:**
- `value` (required): The number you want to find the square root of (must be 0 or positive)

**Returns:**  
The square root of the input number.

**Examples:**
```
sqrt(9)
Result: 3

sqrt(16)
Result: 4
```

**Use Case:** Calculate distances using the Pythagorean theorem, find standard deviation in statistics, or calculate areas and dimensions.

---

## exp

**Definition:**  
Computes Euler's number (e) to the specified power.

**Arguments:**
- `power` (required): The exponent (power) to raise e to

**Returns:**  
The result of e raised to the specified power.

**Examples:**
```
exp(1)
Result: 2.71828...

exp(2)
Result: 7.389...
```

**Use Case:** Calculate exponential growth, compound interest calculations, or population growth models.

---

## log

**Definition:**  
Computes the logarithm of the value in provided base. The base defaults to 10 if not specified.

**Arguments:**
- `number` (required): The number you want to find the logarithm of
- `base` (optional): The base for the logarithm. If not provided, defaults to 10

**Returns:**  
The logarithm of the number in the specified base.

**Examples:**
```
log(100)
Result: 2

log(8; 2)
Result: 3
```

**Use Case:** Calculate pH levels (uses base 10), measure signal strength (decibels), or calculate time complexity in algorithms.

---

## int

**Definition:**  
Returns the greatest integer that is less than or equal to the specified value.

**Arguments:**
- `value` (required): The number you want to convert to an integer

**Returns:**  
The integer (whole number) part of the input, with decimals removed.

**Examples:**
```
int(3.7)
Result: 3

int(5.999)
Result: 5
```

**Use Case:** Convert decimal numbers to whole numbers, calculate whole units (e.g., days, items), or remove decimal precision when not needed.

---

## parseNumber

**Definition:**  
Converts the text string to a number. Some exceptions apply—if the string contains certain mathematical operators (-,%) the result may not return as expected. In these scenarios we recommend using a combination of VALUE and REGEX_REPLACE to remove non-digit values from the string.

**Arguments:**
- `value` (required): A text string that represents a number

**Returns:**  
A numeric value that can be used in mathematical operations.

**Examples:**
```
parseNumber("123")
Result: 123

parseNumber("45.67")
Result: 45.67
```

**Use Case:** Convert text input from forms to numbers, parse numbers from imported data, or convert string values to numeric for calculations.

---

## random

**Definition:**  
Generates a random number. Produces a random number between the inclusive lower and upper bounds. If only one argument is provided a number between 0 and the given number is returned. If floating is true, or either lower or upper are floats, a floating-point number is returned instead of an integer.

**Arguments:**
- `lower` (required): The lower bound (minimum value) for the random number
- `upper` (optional): The upper bound (maximum value). If not provided, generates a number between 0 and `lower`
- `floating` (optional): Set to `true` if you want a decimal number, `false` or omitted for whole numbers

**Returns:**  
A random number within the specified range.

**Examples:**
```
random(10)
Result: A random number between 0 and 10 (e.g., 7)

random(1; 100)
Result: A random number between 1 and 100 (e.g., 42)
```

**Use Case:** Generate random test data, create random IDs or codes, simulate random events, or generate random samples for testing.

# Text & Binary Functions

## concatenate

**Definition:**  
Joins together the text arguments into a single text value. To concatenate static text, surround it with double quotation marks. To concatenate double quotation marks, you need to use a backslash (\) as an escape character. Equivalent to use of the & operator.

**Arguments:**
- `text1` (required): The first text value to join
- `text2` (optional): Additional text values to join (you can include as many as needed)
- `...` (optional): More text values separated by semicolons

**Returns:**  
A single string containing all the text values joined together.

**Examples:**
```
concatenate("Bob"; " - "; 43)
Result: "Bob - 43"

concatenate("Hello"; " "; "World")
Result: "Hello World"
```

**Use Case:** Combine multiple text values into one string, merge names with separators, or create formatted text from different parts.

---

## find

**Definition:**  
Finds an occurrence of stringToFind in whereToSearch string starting from an optional startFromPosition. (startFromPosition is 0 by default.) If no occurrence of stringToFind is found, the result will be 0. Similar to SEARCH(), though SEARCH() returns empty rather than 0 if no occurrence of stringToFind is found.

**Arguments:**
- `stringToFind` (required): The text you want to search for
- `whereToSearch` (required): The text in which to search
- `startFromPosition` (optional): The position in the string where to start searching (0-based, defaults to 0)

**Returns:**  
A number representing the position where the text was found (0-based), or 0 if not found.

**Examples:**
```
find("fox"; "quick brown fox")
Result: 13

find("cat"; "The cat sat on the mat"; 5)
Result: 4
```

**Use Case:** Locate the position of specific text within a string, check if text contains a substring, or find where a word appears in text.

---

## search

**Definition:**  
Searches for an occurrence of stringToFind in whereToSearch string starting from an optional startFromPosition. (startFromPosition is 0 by default.) If no occurrence of stringToFind is found, the result will be empty. Similar to FIND(), though FIND() returns 0 rather than empty if no occurrence of stringToFind is found.

**Arguments:**
- `stringToFind` (required): The text you want to search for
- `whereToSearch` (required): The text in which to search

**Returns:**  
A number representing the position where the text was found (0-based), or empty if not found.

**Examples:**
```
search("World"; "Hello World")
Result: 7

search("test"; "This is a test string")
Result: 10
```

**Use Case:** Find the position of text in a string (returns empty if not found), locate substrings, or check for text existence.

---

## trim

**Definition:**  
Removes whitespace at the beginning and end of the string.

**Arguments:**
- `string` (required): The text string from which to remove leading and trailing spaces

**Returns:**  
A string with all leading and trailing whitespace removed.

**Examples:**
```
trim(" Hello! ")
Result: "Hello!"

trim("  Multiple   Spaces  ")
Result: "Multiple   Spaces"
```

**Use Case:** Clean up user input by removing extra spaces, normalize text data, or prepare strings for comparison.

---

## len

**Definition:**  
Returns the length of a string.

**Arguments:**
- `string` (required): The text string for which you want to find the length

**Returns:**  
A number representing the total number of characters in the string.

**Examples:**
```
len("quick brown fox")
Result: 15

len("Hello")
Result: 5
```

**Use Case:** Count characters in text, validate text length, check if string meets minimum/maximum length requirements, or measure text size.

---

## substitute

**Definition:**  
Replaces occurrences of old_text with new_text. You can optionally specify an index number (starting from 1) to replace just a specific occurrence of old_text. If no index number is specified, then all occurrences of old_text will be replaced. (If you're looking for a way to replace characters in a string from a specified start point instead, see REPLACE().)

**Arguments:**
- `string` (required): The text in which to replace values
- `old_text` (required): The text you want to replace
- `new_text` (required): The text to replace old_text with
- `index` (optional): The specific occurrence to replace (1 = first, 2 = second, etc.). If omitted, all occurrences are replaced

**Returns:**  
A string with the specified text replacements made.

**Examples:**
```
substitute("gold mold"; "old"; "et")
Result: "get met"

substitute("apple apple apple"; "apple"; "orange"; 2)
Result: "apple orange apple"
```

**Use Case:** Replace all occurrences of text, replace specific instances of text, or update text patterns throughout a string.

---

## replace

**Definition:**  
Replaces the number of characters beginning with the start character with the replacement text. (If you're looking for a way to find and replace all occurrences of old_text with new_text, see SUBSTITUTE().)

**Arguments:**
- `string` (required): The text in which to make the replacement
- `start_character` (required): The position where to start replacing (0-based)
- `number_of_characters` (required): How many characters to replace
- `replacement` (required): The text to insert in place of the replaced characters

**Returns:**  
A string with the specified characters replaced by the replacement text.

**Examples:**
```
replace("database"; 1; 5; "o")
Result: "dose"

replace("Hello World"; 6; 5; "Earth")
Result: "Hello Earth"
```

**Use Case:** Replace characters at a specific position, modify text at known locations, or update portions of strings by position.

---

## lower

**Definition:**  
Makes a string lowercase.

**Arguments:**
- `string` (required): The text string to convert to lowercase

**Returns:**  
A string with all characters converted to lowercase.

**Examples:**
```
lower("Hello!")
Result: "hello!"

lower("UPPERCASE TEXT")
Result: "uppercase text"
```

**Use Case:** Normalize text to lowercase, convert user input to consistent case, or prepare text for case-insensitive comparisons.

---

## upper

**Definition:**  
Makes a string uppercase.

**Arguments:**
- `string` (required): The text string to convert to uppercase

**Returns:**  
A string with all characters converted to uppercase.

**Examples:**
```
upper("Hello!")
Result: "HELLO!"

upper("lowercase text")
Result: "LOWERCASE TEXT"
```

**Use Case:** Normalize text to uppercase, convert text to consistent case format, or prepare text for display in uppercase.

---

## rept

**Definition:**  
Repeats string by the specified number of times.

**Arguments:**
- `string` (required): The text to repeat
- `number` (required): How many times to repeat the string

**Returns:**  
A string containing the input text repeated the specified number of times.

**Examples:**
```
rept("Hi! "; 3)
Result: "Hi! Hi! Hi!"

rept("-"; 10)
Result: "----------"
```

**Use Case:** Create repeated patterns, generate separators or dividers, or repeat text for formatting purposes.

---

## left

**Definition:**  
Extract howMany characters from the beginning of the string.

**Arguments:**
- `string` (required): The text from which to extract characters
- `howMany` (required): The number of characters to extract from the start

**Returns:**  
A string containing the specified number of characters from the beginning of the input string.

**Examples:**
```
left("quick brown fox"; 5)
Result: "quick"

left("Hello World"; 3)
Result: "Hel"
```

**Use Case:** Extract the first few characters of text, get prefixes, or retrieve the beginning portion of strings.

---

## mid

**Definition:**  
Extract a substring of count characters starting at whereToStart.

**Arguments:**
- `string` (required): The text from which to extract characters
- `whereToStart` (required): The position where to begin extraction (0-based)
- `count` (required): The number of characters to extract

**Returns:**  
A string containing the extracted characters from the specified position.

**Examples:**
```
mid("quick brown fox"; 6; 5)
Result: "brown"

mid("Hello World"; 0; 5)
Result: "Hello"
```

**Use Case:** Extract text from the middle of a string, get substrings at specific positions, or retrieve portions of text by position and length.

---

## right

**Definition:**  
Extract howMany characters from the end of the string.

**Arguments:**
- `string` (required): The text from which to extract characters
- `howMany` (required): The number of characters to extract from the end

**Returns:**  
A string containing the specified number of characters from the end of the input string.

**Examples:**
```
right("quick brown fox"; 5)
Result: "n fox"

right("Hello World"; 5)
Result: "World"
```

**Use Case:** Extract the last few characters of text, get suffixes, retrieve file extensions, or get the ending portion of strings.

---

## encode

**Definition:**  
Replaces certain characters with encoded equivalents for use in constructing URLs or URIs. Does not encode the following characters: - _ . ~

**Arguments:**
- `component_string` (required): The text string to encode for URL/URI use

**Returns:**  
A URL-encoded string with special characters converted to their encoded equivalents.

**Examples:**
```
encode("chicken & waffles")
Result: "chicken%20%26%20waffles"

encode("hello world")
Result: "hello%20world"
```

**Use Case:** Encode text for use in URLs, prepare strings for web requests, or convert special characters for safe URL transmission.

---

## toBase64

**Definition:**  
Encodes a string to base64.

**Arguments:**
- `value` (required): The text string to encode to base64

**Returns:**  
A base64-encoded string representation of the input.

**Examples:**
```
toBase64("hello world")
Result: "aGVsbG8gd29ybGQ="

toBase64("test")
Result: "dGVzdA=="
```

**Use Case:** Encode text for data transmission, store text in encoded format, or prepare strings for encoding/decoding operations.

---

## fromBase64

**Definition:**  
Decodes a base64 encoded string.

**Arguments:**
- `value` (required): The base64-encoded string to decode

**Returns:**  
The original text string decoded from base64.

**Examples:**
```
fromBase64("aGVsbG8gd29ybGQ=")
Result: "hello world"

fromBase64("dGVzdA==")
Result: "test"
```

**Use Case:** Decode base64-encoded text, retrieve original text from encoded format, or convert encoded data back to readable text.

---

## regexMatch

**Definition:**  
Returns whether the input text matches a regular expression.

**Arguments:**
- `string` (required): The text to check against the pattern
- `regex` (required): The regular expression pattern to match

**Returns:**  
A boolean value (true/1 if the pattern matches, false/0 if it doesn't).

**Examples:**
```
regexMatch("Hello World"; "Hello.World")
Result: 1 (true)

regexMatch("test@email.com"; "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
Result: 1 (true)
```

**Use Case:** Validate text patterns, check if text matches a specific format, verify email addresses, or test string patterns.

---

## regexExtract

**Definition:**  
Returns the first substring that matches a regular expression.

**Arguments:**
- `string` (required): The text from which to extract the matching substring
- `regex` (required): The regular expression pattern to match

**Returns:**  
A string containing the first substring that matches the pattern, or empty if no match is found.

**Examples:**
```
regexExtract("Hello World"; "W.*")
Result: "World"

regexExtract("Email: test@example.com"; "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
Result: "test@example.com"
```

**Use Case:** Extract specific patterns from text, pull out email addresses, get matching substrings, or retrieve formatted data from strings.

---

## regexReplace

**Definition:**  
Substitutes all matching substrings with a replacement string value.

**Arguments:**
- `string` (required): The text in which to make replacements
- `regex` (required): The regular expression pattern to find
- `replacement` (required): The text to replace matching patterns with

**Returns:**  
A string with all matching patterns replaced by the replacement text.

**Examples:**
```
regexReplace("Hello World"; " W.*"; "")
Result: "Hello"

regexReplace("123-456-7890"; "\\d"; "X")
Result: "XXX-XXX-XXXX"
```

**Use Case:** Replace text patterns using regular expressions, mask sensitive data, format text with patterns, or perform advanced text replacements.

---

## split

**Definition:**  
Splits the input string into an array of substrings using the specified separator. An optional limit parameter specifies the maximum number of splits. If limit is provided, the output will contain at most limit elements.

**Arguments:**
- `value` (required): The text string to split
- `separator` (required): The character or text that separates the parts
- `limit` (optional): The maximum number of elements to return in the array

**Returns:**  
An array containing the split substrings.

**Examples:**
```
split("apple,banana,cherry"; ","; 2)
Result: ["apple", "banana"]

split("one two three four"; " ")
Result: ["one", "two", "three", "four"]
```

**Use Case:** Break comma-separated values into arrays, split text by delimiters, parse CSV-like data, or separate text into individual parts.

# Logical Functions

## if

**Definition:**  
Returns value1 if the logical expression is true, otherwise it returns value2. Can also be used to make nested IF statements. Can also be used to check if a cell is blank/is empty.

**Arguments:**
- `expression` (required): A boolean expression or condition to evaluate (must evaluate to true or false)
- `value1` (required): The value to return if the expression is true
- `value2` (required): The value to return if the expression is false

**Returns:**  
Returns value1 if the expression is true, otherwise returns value2. The return type depends on value1 and value2.

**Examples:**
```
if(10 > 5; "Yes"; "No")
Result: "Yes"

if(age >= 18; "Adult"; "Minor")
Result: "Adult" (if age is 18 or greater)
```

**Use Case:** Make decisions based on conditions, return different values based on true/false conditions, or create conditional logic in formulas.

---

## isError

**Definition:**  
Returns true if the expression causes an error.

**Arguments:**
- `expr` (required): Any expression to check for errors

**Returns:**  
A boolean value (true if the expression causes an error, false if it doesn't).

**Examples:**
```
isError(1 / 0)
Result: true

isError(10 / 2)
Result: false
```

**Use Case:** Check if a calculation or expression will cause an error, validate formulas before using results, or handle error cases gracefully.

---

## isObject

**Definition:**  
Returns true if the provided value is an object (including arrays and functions), and false if it is null or any other non-object type.

**Arguments:**
- `value` (required): The value to check if it is an object

**Returns:**  
A boolean value (true if the value is an object, array, or function; false if it's null or a primitive type).

**Examples:**
```
isObject({name: "John"})
Result: true

isObject([1, 2, 3])
Result: true
```

**Use Case:** Check if a value is an object before accessing object properties, validate data types, or determine if a value can be treated as an object.

---

## and

**Definition:**  
Returns true if all the arguments are true, returns false otherwise.

**Arguments:**
- `expr` (required): The first boolean expression to evaluate
- `...` (optional): Additional boolean expressions to evaluate (all must be true)

**Returns:**  
A boolean value (true only if all expressions are true, false if any expression is false).

**Examples:**
```
and(5 > 3; 10 > 8; 2 > 1)
Result: true

and(5 > 3; 10 < 8)
Result: false
```

**Use Case:** Check if multiple conditions are all true, combine multiple boolean checks, or require all criteria to be met.

---

## or

**Definition:**  
Returns true if any one of the arguments is true.

**Arguments:**
- `expr` (required): The first boolean expression to evaluate
- `...` (optional): Additional boolean expressions to evaluate (at least one must be true)

**Returns:**  
A boolean value (true if at least one expression is true, false only if all expressions are false).

**Examples:**
```
or(5 > 10; 10 > 8; 2 < 1)
Result: true

or(5 < 3; 10 < 8)
Result: false
```

**Use Case:** Check if at least one condition is true, provide multiple alternative conditions, or allow any of several criteria to be met.

---

## not

**Definition:**  
Returns true if condition evaluates to false.

**Arguments:**
- `expr` (required): A boolean expression to negate

**Returns:**  
A boolean value (true if the expression is false, false if the expression is true).

**Examples:**
```
not(5 > 10)
Result: true

not(10 > 5)
Result: false
```

**Use Case:** Reverse the logic of a condition, check if something is not true, or negate boolean expressions.

---

## true

**Definition:**  
Represents the boolean value true.

**Arguments:**  
None (this is a keyword/constant value)

**Returns:**  
The boolean value true.

**Examples:**
```
true
Result: true

if(true; "Yes"; "No")
Result: "Yes"
```

**Use Case:** Use as a constant true value in logical expressions, set default boolean values, or use in conditional statements.

---

## false

**Definition:**  
Represents the boolean value false.

**Arguments:**  
None (this is a keyword/constant value)

**Returns:**  
The boolean value false.

**Examples:**
```
false
Result: false

if(false; "Yes"; "No")
Result: "No"
```

**Use Case:** Use as a constant false value in logical expressions, set default boolean values, or use in conditional statements.

# Date & Time Functions

## today

**Definition:**  
Returns the current date (without time component), considering a specified time zone.

**Arguments:**
- `tz_string` (optional): The time zone string (e.g., "America/New_York", "UTC"). If not provided, uses the default time zone.

**Returns:**  
A Date object representing today's date (without time).

**Examples:**
```
today()
Result: 2024-09-19 (current date)

today("America/New_York")
Result: 2024-09-19 (current date in New York timezone)
```

**Use Case:** Get today's date for date comparisons, set default dates, or calculate days from today.

---

## now

**Definition:**  
Returns the current date and time, optionally considering a time zone.

**Arguments:**
- `tz_string` (optional): The time zone string (e.g., "America/New_York", "UTC"). If not provided, uses the default time zone.

**Returns:**  
A Date object representing the current date and time.

**Examples:**
```
now()
Result: 2024-09-19T06:48:03.540Z (current date and time)

now("America/New_York")
Result: 2024-09-19T02:48:03.540-04:00 (current date and time in New York timezone)
```

**Use Case:** Get the current timestamp, record when an action occurred, or calculate time differences from now.

---

## format

**Definition:**  
Formats a given date into the specified output format, optionally considering a time zone.

**Arguments:**
- `date` (required): The date to format (Date object or date string)
- `out_format` (required): The format pattern for the output (e.g., "YYYY-MM-DD", "MM/DD/YYYY", "DD MMM YYYY")
- `tz_string` (optional): The time zone string to use for formatting. If not provided, uses the date's original time zone.

**Returns:**  
A string representing the formatted date according to the specified format.

**Examples:**
```
format(2024-09-19T06:48:03.540Z; "YYYY-MM-DD")
Result: "2024-09-19"

format(2024-09-19T06:48:03.540Z; "MM/DD/YYYY")
Result: "09/19/2024"
```

**Use Case:** Format dates for display, convert dates to specific string formats, or format dates for different locales.

---

## parse

**Definition:**  
Parses a date string according to the specified source format, optionally considering a time zone.

**Arguments:**
- `date_str` (required): The date string to parse (e.g., "2024-09-19", "09/19/2024")
- `src_format` (required): The format pattern of the input date string (e.g., "YYYY-MM-DD", "MM/DD/YYYY")
- `tz_string` (optional): The time zone string to use for parsing. If not provided, uses the default time zone.

**Returns:**  
A Date object parsed from the input string according to the specified format.

**Examples:**
```
parse("2024-09-19"; "YYYY-MM-DD")
Result: 2024-09-19T00:00:00.000Z (Date object)

parse("09/19/2024"; "MM/DD/YYYY")
Result: 2024-09-19T00:00:00.000Z (Date object)
```

**Use Case:** Convert date strings to Date objects, parse dates from user input, or convert dates from different formats.

---

## addSeconds

**Definition:**  
Returns a new date with the specified number of seconds added.

**Arguments:**
- `date` (required): The date to add seconds to (Date object or date string)
- `seconds` (required): The number of seconds to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of seconds.

**Examples:**
```
addSeconds(2024-09-19T06:48:03.540Z; 60)
Result: 2024-09-19T06:49:03.540Z

addSeconds(2024-09-19T06:48:03.540Z; -30)
Result: 2024-09-19T06:47:33.540Z
```

**Use Case:** Add or subtract seconds from a date, calculate future/past timestamps, or adjust dates by small time increments.

---

## addMinutes

**Definition:**  
Returns a new date with the specified number of minutes added.

**Arguments:**
- `date` (required): The date to add minutes to (Date object or date string)
- `minutes` (required): The number of minutes to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of minutes.

**Examples:**
```
addMinutes(2024-09-19T06:48:03.540Z; 60)
Result: 2024-09-19T07:48:03.540Z

addMinutes(2024-09-19T06:48:03.540Z; -15)
Result: 2024-09-19T06:33:03.540Z
```

**Use Case:** Add or subtract minutes from a date, calculate meeting times, or adjust timestamps by minutes.

---

## addHours

**Definition:**  
Returns a new date with the specified number of hours added.

**Arguments:**
- `date` (required): The date to add hours to (Date object or date string)
- `hours` (required): The number of hours to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of hours.

**Examples:**
```
addHours(2024-09-19T06:48:03.540Z; 2)
Result: 2024-09-19T08:48:03.540Z

addHours(2024-09-19T06:48:03.540Z; -3)
Result: 2024-09-19T03:48:03.540Z
```

**Use Case:** Add or subtract hours from a date, calculate times in different time zones, or adjust timestamps by hours.

---

## addDays

**Definition:**  
Returns a new date with the specified number of days added.

**Arguments:**
- `date` (required): The date to add days to (Date object or date string)
- `days` (required): The number of days to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of days.

**Examples:**
```
addDays(2024-09-19T06:48:03.540Z; 7)
Result: 2024-09-26T06:48:03.540Z

addDays(2024-09-19T06:48:03.540Z; -5)
Result: 2024-09-14T06:48:03.540Z
```

**Use Case:** Calculate dates in the future or past, add days for deadlines, or calculate date ranges.

---

## addMonths

**Definition:**  
Returns a new date with the specified number of months added.

**Arguments:**
- `date` (required): The date to add months to (Date object or date string)
- `months` (required): The number of months to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of months.

**Examples:**
```
addMonths(2024-09-19T06:48:03.540Z; 3)
Result: 2024-12-19T06:48:03.540Z

addMonths(2024-09-19T06:48:03.540Z; -2)
Result: 2024-07-19T06:48:03.540Z
```

**Use Case:** Calculate dates months in advance, calculate subscription renewal dates, or add months for billing cycles.

---

## addYears

**Definition:**  
Returns a new date with the specified number of years added.

**Arguments:**
- `date` (required): The date to add years to (Date object or date string)
- `years` (required): The number of years to add (can be negative to subtract)

**Returns:**  
A Date object representing the original date plus the specified number of years.

**Examples:**
```
addYears(2024-09-19T06:48:03.540Z; 1)
Result: 2025-09-19T06:48:03.540Z

addYears(2024-09-19T06:48:03.540Z; -5)
Result: 2019-09-19T06:48:03.540Z
```

**Use Case:** Calculate dates years in the future or past, calculate anniversary dates, or add years for long-term planning.

---

## dateToUnixSeconds

**Definition:**  
Converts a date to Unix timestamp in seconds.

**Arguments:**
- `date` (required): The date to convert to Unix timestamp (Date object or date string)

**Returns:**  
A number representing the Unix timestamp (seconds since January 1, 1970, 00:00:00 UTC).

**Examples:**
```
dateToUnixSeconds(2024-09-19T06:48:03.540Z)
Result: 1726735683

dateToUnixSeconds(2024-01-01T00:00:00.000Z)
Result: 1704067200
```

**Use Case:** Convert dates to Unix timestamps for API calls, store dates as numbers, or calculate time differences in seconds.

# Array Functions

## getValueAt

**Definition:**  
Returns the value at the specified index in an array.

**Arguments:**
- `array` (required): The array from which to get the value
- `index` (required): The position in the array (0-based, where 0 is the first element)

**Returns:**  
The value at the specified index position in the array.

**Examples:**
```
getValueAt([10; 20; 30; 40]; 0)
Result: 10

getValueAt(["apple"; "banana"; "cherry"]; 2)
Result: "cherry"
```

**Use Case:** Access a specific item from an array by its position, retrieve the first or last element, or get a value at a known index.

---

## size

**Definition:**  
Returns the number of items in an array.

**Arguments:**
- `array` (required): The array for which you want to count the items

**Returns:**  
A number representing the total count of elements in the array.

**Examples:**
```
size([10; 20; 30; 40])
Result: 4

size(["red"; "blue"; "green"; "yellow"; "purple"])
Result: 5
```

**Use Case:** Count how many items are in a list, check if an array is empty, or determine the length of a data collection.

---

## arrayToJson

**Definition:**  
Converts an array to a JSON object using specified keys and values.

**Arguments:**
- `array` (required): The array of objects to convert
- `search_keys` (required): The keys to use for the JSON object (can be a string or array of strings)
- `search_values` (required): The values to use for the JSON object (can be a string or array of strings)

**Returns:**  
A JSON object created from the array using the specified keys and values.

**Examples:**
```
arrayToJson([{name: "John"; age: 30}; {name: "Jane"; age: 25}]; "name"; "age")
Result: {"John": 30, "Jane": 25}

arrayToJson([{id: 1; value: 100}; {id: 2; value: 200}]; "id"; "value")
Result: {"1": 100, "2": 200}
```

**Use Case:** Convert array data into a JSON object format, create key-value mappings from arrays, or transform array structures for API responses.

---

## getValuesByKey

**Definition:**  
Returns values from an array of objects based on specified keys.

**Arguments:**
- `array` (required): The array of objects from which to extract values
- `search_keys` (required): The key(s) to search for in each object (can be a string or array of strings)

**Returns:**  
An array containing all the values found for the specified key(s) across all objects.

**Examples:**
```
getValuesByKey([{name: "John"; age: 30}; {name: "Jane"; age: 25}]; "name")
Result: ["John", "Jane"]

getValuesByKey([{id: 1; status: "active"}; {id: 2; status: "inactive"}]; "status")
Result: ["active", "inactive"]
```

**Use Case:** Extract all values for a specific property from an array of objects, get all names from a list of users, or collect specific fields from multiple records.

---

## uniq

**Definition:**  
Returns a new array with all duplicate elements removed from the input array.

**Arguments:**
- `array` (required): The array from which to remove duplicates

**Returns:**  
A new array containing only unique values, with all duplicates removed.

**Examples:**
```
uniq([1; 2; 2; 3; 3; 3; 4])
Result: [1, 2, 3, 4]

uniq(["apple"; "banana"; "apple"; "cherry"; "banana"])
Result: ["apple", "banana", "cherry"]
```

**Use Case:** Remove duplicate entries from a list, get unique values from data, or clean up arrays with repeated items.

---

## join

**Definition:**  
Creates and returns a new string by concatenating all elements of an array, separated by a specified delimiter.

**Arguments:**
- `array` (required): The array whose elements you want to join together
- `delimiter` (required): The text or character to insert between each element (e.g., comma, space, dash)

**Returns:**  
A string containing all array elements joined together with the specified delimiter.

**Examples:**
```
join(["apple"; "banana"; "cherry"]; ", ")
Result: "apple, banana, cherry"

join([1; 2; 3; 4]; "-")
Result: "1-2-3-4"
```

**Use Case:** Combine array elements into a single string, create comma-separated lists, or format array data for display.

---

## slice

**Definition:**  
Returns a shallow copy of a portion of an array into a new array object selected from start to end (end not included). The original array will not be modified.

**Arguments:**
- `value` (required): The array from which to extract elements
- `start` (required): The index position where to begin extraction (0-based)
- `end` (required): The index position where to end extraction (this position is not included)

**Returns:**  
A new array containing the selected elements from the original array.

**Examples:**
```
slice([1; 2; 3; 4; 5]; 1; 3)
Result: [2, 3]

slice(["a"; "b"; "c"; "d"; "e"]; 0; 2)
Result: ["a", "b"]
```

**Use Case:** Extract a portion of an array, get the first few elements, or create a subset of array data without modifying the original.

---

## splice

**Definition:**  
Modifies the contents of an array by removing or replacing existing elements and/or adding new elements in place. The start parameter specifies the index at which to start changing the array. The delete_count parameter specifies the number of elements to remove. Additional elements can be specified to be added to the array starting from the start index.

**Arguments:**
- `value` (required): The array to modify
- `start` (required): The index position where to start making changes
- `delete_count` (required): The number of elements to remove from the array
- `...ele` (optional): Additional elements to add to the array at the start position

**Returns:**  
A new array with the modifications applied (elements removed and/or added).

**Examples:**
```
splice([1; 2; 3; 4; 5]; 1; 2; "a"; "b")
Result: [1, "a", "b", 4, 5]

splice([10; 20; 30; 40]; 1; 1)
Result: [10, 30, 40]
```

**Use Case:** Remove elements from an array, replace array elements, insert new elements at a specific position, or modify array contents in place.

---

## concatArray

**Definition:**  
Utility function used to create a new array by concatenating an initial array with additional arrays and/or individual values.

**Arguments:**
- `array` (required): The initial array to concatenate (can be repeated for multiple arrays)
- `[values] (...*)` (optional): Additional arrays or individual values to add to the result

**Returns:**  
A new array containing all elements from the input arrays and values combined together.

**Examples:**
```
concatArray([1; 2]; [3; 4])
Result: [1, 2, 3, 4]

concatArray(["a"; "b"]; "c"; ["d"; "e"])
Result: ["a", "b", "c", "d", "e"]
```

**Use Case:** Combine multiple arrays into one, merge arrays with additional values, or join different data collections together.

# Other Functions

## isEmpty

**Definition:**  
Returns true if value in the parameter is empty, null, {}, [] or undefined and false otherwise.

**Arguments:**
- `value` (required): The value to check if it is empty

**Returns:**  
A boolean value (true if the value is empty, null, empty object {}, empty array [], or undefined; false otherwise).

**Examples:**
```
isEmpty("")
Result: true

isEmpty([])
Result: true
```

**Use Case:** Check if a value is empty before processing, validate required fields, or check if data exists.

---

## isEmptyOrNull

**Definition:**  
Returns true if value in the parameter is empty, null or undefined and false otherwise.

**Arguments:**
- `value` (required): The value to check if it is empty or null

**Returns:**  
A boolean value (true if the value is empty string, null, or undefined; false otherwise).

**Examples:**
```
isEmptyOrNull(null)
Result: true

isEmptyOrNull("")
Result: true
```

**Use Case:** Check if a value is empty or null (but not empty objects/arrays), validate input fields, or check for null/undefined values.

---

## isNotEmpty

**Definition:**  
Returns true if value in the parameter is not empty, null, {}, [] or undefined and false otherwise.

**Arguments:**
- `value` (required): The value to check if it is not empty

**Returns:**  
A boolean value (true if the value has content and is not null, empty object, empty array, or undefined; false otherwise).

**Examples:**
```
isNotEmpty("OUTE")
Result: true

isNotEmpty([1, 2, 3])
Result: true
```

**Use Case:** Verify that a value has content, check if data is populated, or validate that fields are filled.

---

## isNotEmptyOrNull

**Definition:**  
Returns true if value in the parameter is not empty, null or undefined and false otherwise.

**Arguments:**
- `value` (required): The value to check if it is not empty or null

**Returns:**  
A boolean value (true if the value has content and is not null or undefined; false otherwise).

**Examples:**
```
isNotEmptyOrNull("OUTE")
Result: true

isNotEmptyOrNull(123)
Result: true
```

**Use Case:** Check if a value has content (excluding null/undefined), validate non-empty values, or ensure data exists.

---

## isValueExists

**Definition:**  
Returns true if search value exists in the provided src argument.

**Arguments:**
- `src` (required): The source to search in (can be a string or array)
- `search_value` (required): The value to search for

**Returns:**  
A boolean value (true if the search value is found in the source; false otherwise).

**Examples:**
```
isValueExists("OUTE"; "O")
Result: true

isValueExists(["OUTE"]; "OUTE")
Result: true
```

**Use Case:** Check if a value exists in a string or array, search for specific items, or verify membership in a collection.

---

## merge

**Definition:**  
Returns merged data from two objects.

**Arguments:**
- `arg1` (required): The first object to merge
- `arg2` (required): The second object to merge

**Returns:**  
An object containing all properties from both input objects combined.

**Examples:**
```
merge({month: 1}; {year: 2021})
Result: {month: 1, year: 2021}

merge({name: "John"}; {age: 30})
Result: {name: "John", age: 30}
```

**Use Case:** Combine two objects into one, merge configuration objects, or combine data from multiple sources.

---

## toObject

**Definition:**  
Converts a JSON string to an object.

**Arguments:**
- `value` (required): A JSON string to convert to an object

**Returns:**  
An object parsed from the JSON string.

**Examples:**
```
toObject("{\"name\": \"John\"}")
Result: {name: "John"}

toObject("{\"id\": 1, \"status\": \"active\"}")
Result: {id: 1, status: "active"}
```

**Use Case:** Parse JSON strings from APIs, convert JSON text to objects, or deserialize JSON data.

---

## toStringify

**Definition:**  
Converts an object to a JSON string.

**Arguments:**
- `value` (required): The object to convert to a JSON string

**Returns:**  
A JSON string representation of the input object.

**Examples:**
```
toStringify({name: "John"})
Result: "{\"name\":\"John\"}"

toStringify({id: 1, status: "active"})
Result: "{\"id\":1,\"status\":\"active\"}"
```

**Use Case:** Convert objects to JSON strings for storage, serialize data for API calls, or convert objects to text format.

---

## getValueByPath

**Definition:**  
Gets the value of an object at the specified path.

**Arguments:**
- `value` (required): The object from which to get the value
- `path_str` (required): The path to the value using dot notation (e.g., "user.name", "data.items.0")

**Returns:**  
The value at the specified path in the object, or undefined if the path doesn't exist.

**Examples:**
```
getValueByPath({name: {first: "John"}}; "name.first")
Result: "John"

getValueByPath({user: {profile: {age: 30}}}; "user.profile.age")
Result: 30
```

**Use Case:** Access nested object properties, get values from deep object structures, or retrieve data using path notation.

---

## getKeys

**Definition:**  
Gets the keys of an object.

**Arguments:**
- `value` (required): The object from which to get the keys

**Returns:**  
An array containing all the property names (keys) of the object.

**Examples:**
```
getKeys({name: "John"; age: 30})
Result: ["name", "age"]

getKeys({id: 1; status: "active"; type: "user"})
Result: ["id", "status", "type"]
```

**Use Case:** Get all property names from an object, iterate over object keys, or list available fields in an object.

---

## getValues

**Definition:**  
Gets the values of an object.

**Arguments:**
- `value` (required): The object from which to get the values

**Returns:**  
An array containing all the property values of the object.

**Examples:**
```
getValues({name: "John"; age: 30})
Result: ["John", 30]

getValues({id: 1; status: "active"})
Result: [1, "active"]
```

**Use Case:** Extract all values from an object, get object values as an array, or collect data values for processing.

