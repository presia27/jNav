# jNav - JSON-based Web Navigation System

This project aims to define the structure and create tools for storing links in JSON format, which can be loaded into a webpage and used to build site navigation tools.

The format consists more or less of a giant, nested array, with sections, headings and entries. This format is designed to be extensible, with each block of code following a similar arrangement of curly braces, and differentiated by a "type."

Here's an example of the format:

    [
        {
            "type": "section",
            "id": "Sample_Section",
            "sectionName": "Sample Section",
            "content": [

                {
                    "type": "heading1",
                    "id": "sampleHead1",
                    "value": "Sample Heading"
                },
                {
                    "type": "heading2",
                    "id": "sampleHead2",
                    "value": "Sample Heading"
                },
                {
                    "type": "entry",
                    "id": "exampleEntry",
                    "title": "Title name",
                    "description": "Short description",
                    "style": [],
                    "linkType": "",
                    "url": "",
                    "action": ""
                }

            ]
        }
    ]


Definitions and options:
 - "type": "section" "heading1" "heading2" "entry"

 - if the type is **"section"**
    - id - unique alpha-numeric id (no spaces or characters other than an underscore or hyphen)
    - sectionName - Friendly name for users (can be used for display)
    - content - JSON objects describing the content within the section (including other nested sections)

 - if the type is **"heading1"** or **"heading2"**
    - *Place object within section "content" brackets.*
    - *Used to display different sized headings to identify the section to the user graphically. The section name can be used as well, but this provides more flexibility.*
    - id - unique alpha-numeric id (no spaces or characters other than an underscore or hyphen)
    - value - Name of heading (used for display)

- if the type is **"entry"**
    - *Place object within section "content" brackets.*
    - *Contains content used to build navigation listings/entries*
    - id - unique alpha-numeric id (no spaces or characters other than an underscore or hyphen)
    - title - Name of entry (used for display)
    - description - short description of item (can be used for display, or alt text)
    - style - style tags used for styling. Options are:
        - (empty for default)
        - bold (bold text)
        - ital (italicized text)
        - underline (underlined)
        - indent (indent text)
    - linkType - type of link. Types are:
        - hyperlink (link to webpage)
        - pdf (PDF document)
        - mso (Microsoft Office Document)
        - html (HTML code)
    - url - URL link to resource
    - action - specifies what happens when the user clicks on the link. Options are:
        - frame (iframe on the current page)
        - currentWindow (load to current window)
        - newTab (load to new tab)


Implementation of all these features depends on use case.

This code is licensed under the Apache License, version 2.0
