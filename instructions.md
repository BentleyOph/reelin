Instructions for Aider and other LLM tools:
Keep it simple!

1. Embrace Simplicity Over Cleverness
- Write code that's immediately understandable to others
- If a solution feels complex, it probably needs simplification
- Optimize for readability first, performance second unless proven otherwise
- Avoid premature optimization

2. Focus on Core Functionality
- Start with the minimum viable solution
- Question every feature: "Is this really necessary?"
- Build incrementally based on actual needs, not hypothetical ones
- Delete unnecessary code and features

3. Leverage Existing Solutions
- Use standard libraries whenever possible
- Don't reinvent the wheel
- Choose well-maintained, popular libraries for common tasks
- Keep dependencies minimal but practical

4. Function Design
- Each function should have a single responsibility
- Keep functions short (typically under 20 lines)
- Use descriptive names that indicate purpose
- Limit number of parameters (3 or fewer is ideal)

5. Project Structure
- Keep related code together
- Use consistent file organization
- Maintain a flat structure where possible
- Group by feature rather than type

```plaintext
# Good project structure
project/
├── main.py
├── config.py
├── users/
│   ├── models.py
│   ├── services.py
│   └── tests/
└── utils/
    └── helpers.py
```

6. Code Review Guidelines
- Review for simplicity first
- Question complexity and overengineering
- Look for duplicate code and abstraction opportunities
- Ensure consistent style and naming conventions

7. Maintenance Practices
- Regularly remove unused code
- Keep dependencies updated
- Refactor when code becomes unclear
- Document only what's necessary and likely to change

Remember:
- Simple code is easier to maintain and debug
- Write code for humans first, computers second
- Add complexity only when justified by requirements
- If you can't explain your code simply, it's probably too complex


Complexity is what kills you
When you finish editing, present me with a list of options of how we could continue. Indicate what you think should be the next step
When I just send you the letter c, I mean continue
Make scripts executable
Add docstrings or comments only to explain the why 
When you see comments or docstrings that are not necessary remove them.
Use type hints when possible.

Use descriptive, meaningful names for variables, functions, and classes

Group related code together
Use consistent indentation (typically 2 or 4 spaces)
Add spacing between logical sections

Handle potential errors explicitly
Validate input data
Return meaningful error messages

Use consistent formatting
Avoid deep nesting of conditionals

## Common Anti-Patterns to Avoid

1. God Classes: Classes that do too much
2. Feature Envy: Methods that use more features of other classes than their own
3. Long Parameter Lists: Methods with too many parameters
4. Tight Coupling: Classes that know too much about each other
5. Premature Optimization: Making code complex for theoretical performance gains


## How to solve bugs 
Reflect on 5 -7 different possible sources of the problem, distill those down to 1-2 most likely sources, and then add logs to validate your assumptions before we move onto implementing the actual code fix.