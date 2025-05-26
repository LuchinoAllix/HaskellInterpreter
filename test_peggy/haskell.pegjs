start = program

program = (lexeme / whitespace)*

lexeme = qvarid / qconid / qvarsym / qconsym / literal / special / reservedop / reservedid

literal = integer / float / char / string

special = "(" / ")" / "," / ";" / "[" / "]" / "`" / "{" / "}"

whitespace = whitestuff+

whitestuff = whitechar / comment / ncomment

whitechar = newline / vertab / space / tab / uniWhite

newline = return linefeed / return / linefeed / formfeed

return = "\r"

linefeed = "\n"

vertab = "\v"

formfeed = "\f"

space = " "

tab = "\t"

uniWhite = [\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]

comment = dashes (any !symbol any*)? newline

dashes = "--" / "-"*

opencom = "{-"

closecom = "-}"

ncomment = opencom ANY_seq (ncomment ANY_seq)* closecom

ANY_seq = ANY* !(ANY* (opencom / closecom) ANY*)

ANY = graphic / whitechar

any = graphic / space / tab

graphic = small / large / symbol / digit / special / "\"" / "\'"

small = ascSmall / uniSmall / "_"

ascSmall = [a-z]

uniSmall = [\u00E0-\u00F6\u00F8-\u00FF]

large = ascLarge / uniLarge

ascLarge = [A-Z]

uniLarge = [\u00C0-\u00D6\u00D8-\u00DE]

symbol = ascSymbol / uniSymbol !(special / "_" / "\"" / "\'")

ascSymbol = "!" / "#" / "$" / "%" / "&" / "⋆" / "+" / "." / "/" / "<" / "=" / ">" / "?" / "@" / "\\" / "\^" / "|" / "~" / "-" / ":"

uniSymbol = [\u00A1-\u00A7\u00A9-\u00AB\u00AC\u00AE\u00AF\u00B0-\u00B1\u00B4\u00B6-\u00B8\u00BB\u00BF\u00D7\u00F7\u2010-\u2027\u2030-\u203E\u2041-\u2053\u2055-\u205E\u2190-\u23FF\u2500-\u2775\u2794-\u2BFF\u2E00-\u2E7F\u3001-\u3003]

digit = ascDigit / uniDigit

ascDigit = [0-9]

uniDigit = [\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE7-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29]

octit = [0-7]

hexit = digit / [A-Fa-f]

varid = (small (small / large / digit / "\'" )* ) !(reservedid)

conid = large (small / large / digit / "\'" )*

reservedid = "case" / "class" / "data" / "default" / "deriving" / "do" / "else" / "foreign" / "if" / "import" / "in" / "infix" / "infixl" / "infixr" / "instance" / "let" / "module" / "newtype" / "of" / "then" / "type" / "where" / "_"

varsym = (symbol !":" symbol*) !(reservedop / dashes)

consym = (":" {symbol}) !(reservedop)

reservedop = ".." / ":" / "::" / "=" / "\\" / "|" / "<-" / "->" / "@" / "~" / "=>"

qvarid = (modid ".")? varid

qconid = (modid ".")? conid

qtycon = (modid ".")? tycon

qtycls = (modid ".")? tycls

qvarsym = (modid ".")? varsym

qconsym = (modid ".")? consym

modid = (conid ".")* conid

tyvar = varid

tycon = conid

tycls = conid

decimal = digit digit*

octal = octit octit*

hexadecimal = hexit hexit*

integer = decimal / "0o" octal / "0O" octal / "0x" hexadecimal / "0X" hexadecimal

float = decimal "." decimal exponent? / decimal exponent

exponent = ("e" / "E") ("+" / "-")? decimal

char = "\'" (graphic !("\'" / "\\") / space / escape !"&") "\'"

string = "\"" (graphic !("\"" / "\\") / space / escape /gap) "\""

escape = "\\" (charesc / ascii / decimal / "o" octal / "x" hexadecimal)

charesc = "a" / "b" / "f" / "n" / "r" / "t" / "v" / "\\" / '"' / "\'" / "&"

ascii = "^" cntrl / "NUL" / "SOH" / "STX" / "ETX" / "EOT" / "ENQ" / "ACK" / "BEL" / "BS" / "HT" / "LF" / "VT" / "FF" / "CR" / "SO" / "SI" / "DLE" / "DC1" / "DC2" / "DC3" / "DC4" / "NAK" / "SYN" / "ETB" / "CAN" / "EM" / "SUB" / "ESC" / "FS" / "GS" / "RS" / "US" / "SP" / "DEL"

cntrl = ascLarge / "@" / "[" / "\\" / "]" / "^" / "_"

gap = "\\" whitechar whitechar* "\\"