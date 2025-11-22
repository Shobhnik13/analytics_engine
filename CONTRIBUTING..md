# Branch Naming Conventions

Use **kebab-case** and follow these patterns:

### **Feature Branches**

```
feature/<short-description>
```

Examples:

```
feature/add-dau-endpoint
feature/clickhouse-batch-insert
```

### **Bug Fix Branches**

```
fix/<issue-description>
```

Examples:

```
fix/worker-json-parse-error
fix/clickhouse-permission-issue
```

### **Documentation Updates**

```
docs/<update-topic>
```

Examples:

```
docs/update-readme
docs/add-api-examples
```

### **Refactor / Cleanup**

```
refactor/<area>
```

Examples:

```
refactor/worker-loop
refactor/analytics-service
```

### **Hotfix (Critical production fix)**

```
hotfix/<issue>
```

---

# Commit Message Guidelines (Conventional Commits)

Follow **Conventional Commit** syntax:

```
<type>(scope?): <short description>
```

### Allowed Types

| Type          | Use For                                 |
| ------------- | --------------------------------------- |
| **feat:**     | New feature                             |
| **fix:**      | Bug fix                                 |
| **docs:**     | Documentation changes                   |
| **refactor:** | Code restructuring (no behavior change) |
| **perf:**     | Performance improvements                |
| **test:**     | Adding or updating tests                |
| **chore:**    | Build, config, tooling updates          |

### Examples

```
feat(analytics): add MAU calculation endpoint
fix(worker): correct JSON parsing for Redis stream
docs(readme): update setup instructions
refactor(clickhouse): improve batch insert structure
perf(db): optimize query execution time
chore(deps): update dependencies
```

### Rules

* Keep messages short & meaningful
* Keep the commits short 
