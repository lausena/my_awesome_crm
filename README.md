# My Awesome CRM

An enterprise-grade CRM application designed for sales, support, and customer success teams.

## Agent-Driven Development Workflow

This project uses specialized AI agents to follow software development lifecycle (SDLC) best practices. Each agent brings deep domain expertise to ensure quality deliverables at every stage.

### Available Agents

- **Product Manager** (`product-manager`): Requirements gathering, user research, roadmap planning
- **Reviewer** (`reviewer`): Quality assurance, stakeholder validation, risk assessment  
- **Software Architect** (`software-architect`): System design, technology selection, architectural patterns
- **Backend Engineer** (`backend-engineer`): API development, database design, microservices architecture
- **Frontend Engineer** (`frontend-engineer`): UI/UX implementation, real-time updates, data-heavy interfaces
- **Deployment Engineer** (`deployment-engineer`): CI/CD, infrastructure, monitoring, security

## SDLC Agent Workflow

Follow this sequence to ensure comprehensive coverage of all development aspects:

### 1. **Discovery & Planning Phase**
```bash
# Define project scope and requirements
claude --agent product-manager "Define requirements for [feature/project name]. Include user stories, acceptance criteria, and success metrics."

# Review and validate requirements
claude --agent reviewer "Review the product requirements document. Validate completeness, feasibility, and business alignment."
```

### 2. **Architecture & Design Phase**
```bash
# Create system architecture
claude --agent software-architect "Design the system architecture for [feature/project]. Include technology stack, scalability considerations, and integration patterns."

# Review architecture decisions
claude --agent reviewer "Review the proposed architecture. Assess technical feasibility, scalability, and alignment with business requirements."
```

### 3. **Implementation Phase**
```bash
# Backend development
claude --agent backend-engineer "Implement the backend services for [feature]. Include API endpoints, database schema, and business logic."

# Frontend development  
claude --agent frontend-engineer "Build the frontend interface for [feature]. Focus on user experience, real-time updates, and performance."

# Review implementations
claude --agent reviewer "Review the backend and frontend implementations. Check code quality, security, and requirement fulfillment."
```

### 4. **Deployment & Operations Phase**
```bash
# Setup deployment pipeline
claude --agent deployment-engineer "Create CI/CD pipeline and infrastructure for [feature/project]. Include monitoring, security, and scalability."

# Final review
claude --agent reviewer "Conduct final review of the complete solution. Validate deployment readiness and operational procedures."
```

## Best Practices

### Agent Collaboration Patterns

1. **Requirements Validation**: Always follow product manager work with reviewer validation
2. **Architecture Review**: Have reviewer assess all major architectural decisions
3. **Cross-functional Implementation**: Coordinate backend and frontend development
4. **Deployment Readiness**: Ensure deployment engineer reviews before production release

### Agent Communication

- **Handoffs**: Each agent should provide clear deliverables for the next phase
- **Documentation**: Agents should document decisions and rationale
- **Feedback Loops**: Use reviewer agent to validate work quality at each stage
- **Iteration**: Be prepared to iterate based on agent feedback

### Quality Gates

- Requirements must pass reviewer validation before architecture phase
- Architecture must be approved before implementation begins  
- Implementation must pass security and performance review
- Deployment must include monitoring and rollback procedures

## Example Workflows

### New Feature Development
1. Product Manager → Define user stories and acceptance criteria
2. Reviewer → Validate requirements completeness and business value
3. Software Architect → Design system architecture and data models
4. Backend Engineer → Implement APIs and business logic
5. Frontend Engineer → Build user interface and interactions
6. Reviewer → Code quality and security review
7. Deployment Engineer → Setup CI/CD and production deployment
8. Reviewer → Final validation and launch readiness

### Bug Investigation & Fix
1. Product Manager → Prioritize and define scope of bug fix
2. Software Architect → Analyze system impact and solution approach
3. Backend Engineer / Frontend Engineer → Implement fix
4. Reviewer → Validate fix quality and test coverage
5. Deployment Engineer → Deploy with monitoring and rollback plan

### System Optimization
1. Software Architect → Analyze performance bottlenecks and propose solutions
2. Backend Engineer / Frontend Engineer → Implement optimizations
3. Deployment Engineer → Update infrastructure and monitoring
4. Reviewer → Validate performance improvements and stability

## Agent Expertise Summary

| Agent | Primary Focus | Key Deliverables |
|-------|---------------|------------------|
| Product Manager | Business requirements, user research | User stories, roadmaps, success metrics |
| Reviewer | Quality assurance, risk assessment | Review reports, validation, recommendations |
| Software Architect | System design, technology decisions | Architecture diagrams, technical specifications |
| Backend Engineer | Server-side logic, APIs, data | API implementations, database schemas |
| Frontend Engineer | User interface, client-side logic | UI components, user workflows |
| Deployment Engineer | Infrastructure, CI/CD, operations | Deployment pipelines, monitoring, security |

## Getting Started

1. Choose the appropriate agent for your current phase
2. Provide clear context and requirements to the agent
3. Follow the SDLC workflow for comprehensive coverage
4. Use the reviewer agent for quality validation at each stage
5. Iterate based on feedback and changing requirements

This agent-driven approach ensures that domain expertise is applied at every stage of development, resulting in higher quality, more maintainable, and better-aligned software solutions.