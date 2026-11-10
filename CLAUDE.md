# Writing Style Guide (from posts/)

Notes inferred from Vishal Katti's existing blog posts, for writing new posts in this repo consistently.

## Voice & Tone
- Conversational and first-person ("I regularly deal with...", "Let us create some data.", "Guess, I woke up and chose violence today!").
- Teaches like explaining to a peer/future self — practical, not academic. Often frames the post as a note "for myself and others."
- Dry, understated humor and self-aware asides (parenthetical jokes, "(Damn these well-named functions!)", "YIKES!!", pop-culture references like Jurassic Park's Dr. Ian Malcolm, XKCD/Reddit comics).
- Occasional exclamation points and rhetorical questions to keep pace conversational: "Wouldn't it be nice if...?", "Do you think our function is robust enough?"
- Not afraid of mild opinion/strong claims stated plainly (e.g. "YYYY-MM-DD is the Goat!!").

## Structure
- YAML frontmatter: title, subtitle, abstract (1-2 sentences describing what the post demonstrates), author, date, image, categories, `citation: true`, `license: "CC BY"`, and usually a `social-share` filter block with permalink/description.
- Title often has a playful or punny subtitle separated by " - " or ":".
- Opens with an "Intro" or unlabeled lead-in paragraph that motivates the topic with a real-world scenario before touching any code.
- Uses `##`/`#` headers matching function/concept names in backticks (e.g. `` ## `select()` ``) to mirror the package/API structure being taught.
- Multi-part series get a "Quick Recap" section linking back to the previous part.
- Ends with a "Conclusion" (or "Closing") section that summarizes the takeaway in a few sentences, sometimes with a signoff line ("Happy Gathering!", "Happy Coding!").
- Ends with a "References" or "References & Citations" section, bullet list, citing R/Python packages used (package, author, year, CRAN link) and any external articles referenced.

## Code & Examples
- Code-first teaching: show a naive/minimal version, demonstrate where it breaks or is insufficient, then iteratively improve it across sections.
- Comments in code are short, explain the "why" or highlight a gotcha (`# YIKES!! Aggregating Student ID to show unique ids in each course.`, `# duh!`).
- Every code chunk is followed by prose interpreting the output, not left to speak for itself.
- Uses realistic, sometimes personality-laden sample data (gapminder, student/course tables, txhousing) rather than dry `foo`/`bar` examples.
- Callout blocks (`::: callout-note`, `callout-tip`, `callout-warning`, `callout-caution`) are used for asides, gotchas, and definitions — not crammed into body text.
- Footnotes used for tangential definitions (e.g. defining "R Project" or "DRY") so the main text stays uninterrupted.
- Images/GIFs are used liberally to illustrate before/after or step-by-step UI actions, usually centered via `::: {style="text-align:center;"}`.

## Formatting conventions
- Package names wrapped in curly braces with backticks: `` `{dplyr}` ``, `` `{reactable}` ``.
- Function names always in backticks with parens: `` `select()` ``, `` `pivot_longer()` ``.
- Bold used for key terms being introduced or emphasized, not for general emphasis.
- Numbered lists for sequential instructions/steps; bullet lists for unordered facts or options.

## When writing a new post
- Start with a relatable problem/pain point, not the tool.
- Build up complexity gradually — show what doesn't work or looks "ugly" before the clean solution.
- Keep an approachable, slightly self-deprecating, enthusiastic tone — this is a practitioner sharing hard-won lessons, not a formal tutorial.
- Always close with Conclusion + References sections.
