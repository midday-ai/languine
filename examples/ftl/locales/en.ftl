# PLACEABLES
# $title (String) - The title of the bookmark to remove.
remove-bookmark = Are you sure you want to remove { $title }?

-brand-name-simple = Umbrella
installing = Installing { -brand-name-simple }.

menu-save = Save
help-menu-save = Click { menu-save } to save the file.


# SPECIAL CHARACTERS
opening-brace = This message features an opening curly brace: {"{"}.
closing-brace = This message features a closing curly brace: {"}"}.

blank-is-removed =     This message starts with no blanks.
blank-is-preserved = {"    "}This message starts with 4 spaces.

leading-bracket =
    This message has an opening square bracket
    at the beginning of the third line:
    {"["}.

attribute-how-to =
    To add an attribute to this messages, write
    {".attr = Value"} on a new line.
    .attr = An actual attribute (not part of the text value above)

# This is OK, but cryptic and hard to read and edit.
literal-quote1 = Text in {"\""}double quotes{"\""}.

# This is preferred. Just use the actual double quote character.
literal-quote2 = Text in "double quotes".

privacy-label = Privacy{"\u00A0"}Policy

# The dash character is an EM DASH but depending on the font face,
# it might look like an EN DASH.
which-dash1 = It's a dash—or is it?

# Using a Unicode escape sequence makes the intent clear.
which-dash2 = It's a dash{"\u2014"}or is it?

# This will work fine, but the codepoint can be considered
# cryptic by other translators.
tears-of-joy1 = {"\U01F602"}

# This is preferred. You can instantly see what the Unicode
# character used here is.
tears-of-joy2 = 😂

# On programming language (JavaScript)
let bundle = new FluentBundle("en"
bundle.addMessages(`
privacy-label = Privacy{"\\u00A0"}Policy
`


# MULTILINE TEXT
single = Text can be written in a single line.

multi = Text can also span multiple lines as long as
    each new line is indented by at least one space.
    Because all lines in this message are indented
    by the same amount, all indentation will be
    removed from the final value.

block =
    Sometimes it's more readable to format
    multiline text as a "block", which means
    starting it on a new line. All lines must
    be indented by at least one space.

indents =
    Indentation common to all indented lines is removed
    from the final text value.
      This line has 2 spaces in front of it.

leading-spaces =     This message's value starts with the word "This".

leading-lines =


    This message's value starts with the word "This".
    The blank lines under the identifier are ignored.

blank-lines =

    The blank line above this line is ignored.
    This is a second line of the value.

    The blank line above this line is preserved.

multiline1 =
    This message has 4 spaces of indent
        on the second line of its value.

multiline2 =
      This message starts with 2 spaces on the first
    first line of its value. The first 4 spaces of indent
    are removed from all lines.

multiline3 = This message has 4 spaces of indent
        on the second line of its value. The first
    line is not considered indented at all.

# Same value as multiline3 above.
multiline4 =     This message has 4 spaces of indent
        on the second line of its value. The first
    line is not considered indented at all.

multiline5 = This message ends up having no indent
        on the second line of its value.


# VARIABLES
welcome = Welcome, { $user }!
unread-emails = { $user } has { $email-count } unread emails.

# Implicit Formatting $duration (Number) - The duration in seconds.
time-elapsed-implicit = Time elapsed: { $duration }s.

# Explicit Formatting, $duration (Number) - The duration in seconds.
time-elapsed-explicit = Time elapsed: { NUMBER($duration, maximumFractionDigits: 0) }s.

# SELECTORS
emails =
    { $unreadEmails ->
        [one] You have one unread email.
       *[other] You have { $unreadEmails } unread emails.
    }

your-rank = { NUMBER($pos, type: "ordinal") ->
   [1] You finished first!
   [one] You finished {$pos}st
   [two] You finished {$pos}nd
   [few] You finished {$pos}rd
  *[other] You finished {$pos}th
}


# ATTRIBUTES
login-input = Predefined value
    .placeholder = email@example.com
    .aria-label = Login input value
    .title = Type your login email


# TERMS
-brand-name-term = Umbrella

about = About { -brand-name-term }.
update-successful = { -brand-name-term } has been updated.

# A contrived example to demonstrate how variables
# can be passed to terms.
-https = https://{ $host }
visit = Visit { -https(host: "example.com") } for more information.

-brand-name-params =
    { $case ->
       *[nominative] Umbrella
        [locative] Umbrellaa
    }

# "About Umbrella."
about = Informacje o { -brand-name-params(case: "locative") }.

-brand-name-default =
    { $case ->
       *[nominative] Umbrella
        [locative] Umbrellaa
    }

# "Umbrella has been successfully updated."
update-successful = { -brand-name-default } został pomyślnie zaktualizowany.

-brand-name-gender = Aurora
    .gender = feminine

update-successful =
    { -brand-name-gender.gender ->
        [masculine] { -brand-name-gender} został zaktualizowany { $userName }.
        [feminine] { -brand-name-gender } została zaktualizowana { $userName }.
       *[other] Program { -brand-name-gender } został zaktualizowany { $userName }.
    }


# COMMENTS

### Localization for Server-side strings of Umbrella Screenshots

## Global phrases shared across pages

my-shots = My Shots
home-link = Home
screenshots-description =
    Screenshots made simple. Take, save, and
    share screenshots without leaving Umbrella.

## Creating page

# Note: { $title } is a placeholder for the title of the web page
# captured in the screenshot. The default, for pages without titles, is
# creating-page-title-default.
creating-page-title = Creating { $title }
creating-page-title-default = page
creating-page-wait-message = Saving your shot…


# BUILD-IN-FUNCTIONS
emails = You have { $unreadEmails } unread emails.
emails2 = You have { NUMBER($unreadEmails) } unread emails.

last-notice =
    Last checked: { DATETIME($lastChecked, day: "numeric", month: "long") }.