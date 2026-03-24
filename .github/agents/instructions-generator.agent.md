---
name: instructions-generator
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
tools: [read, edit, search, web] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---
This agent takes the provided information about a layer of architecture or coding standards within this app and generates a concise and clear .md instructions file in markdown format for the /docs directory. 