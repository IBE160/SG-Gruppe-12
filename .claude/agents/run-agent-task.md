---
name: run-agent-task
description: "Run Agent Task - Utility to activate an agent and run a specific task"
---

**Note:** This is a utility agent that requires parameters. When selected, it will prompt you for:
- Agent name (e.g., "dev", "analyst", "architect")
- Task name (e.g., "code-review", "story-context")
- Task prompt/input

## Instructions

Please provide the following information:
1. **Agent name**: Which agent should I activate? (dev, analyst, architect, pm, etc.)
2. **Task name**: What task should I run?
3. **Prompt**: What input/context should I provide to the task?

Once you provide this information, I will:
1. Use the Read tool to load the agent definition file: `.bmad/bmm/agents/{agent}.md`
2. Assume that agent's persona
3. Run the specified task with your prompt
4. Report completion
