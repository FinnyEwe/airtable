import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  const projectBase = await prisma.base.create({
    data: {
      name: "Project Tracker",
      createdById: user.id,
    },
  });

  const tasksTable = await prisma.table.create({
    data: {
      name: "Tasks",
      order: 0,
      baseId: projectBase.id,
    },
  });

  const [titleField, statusField, assigneeField, dueDateField, priorityField] =
    await Promise.all([
      prisma.field.create({ data: { name: "Title",    type: "text",   order: 0, tableId: tasksTable.id } }),
      prisma.field.create({ data: { name: "Status",   type: "select", order: 1, tableId: tasksTable.id, config: JSON.stringify({ options: ["Todo", "In Progress", "In Review", "Done"] }) } }),
      prisma.field.create({ data: { name: "Assignee", type: "text",   order: 2, tableId: tasksTable.id } }),
      prisma.field.create({ data: { name: "Due Date", type: "date",   order: 3, tableId: tasksTable.id } }),
      prisma.field.create({ data: { name: "Priority", type: "select", order: 4, tableId: tasksTable.id, config: JSON.stringify({ options: ["Low", "Medium", "High", "Critical"] }) } }),
    ]);

  await Promise.all([
    prisma.view.create({ data: { name: "All Tasks",    type: "grid",   order: 0, tableId: tasksTable.id } }),
    prisma.view.create({ data: { name: "Kanban Board", type: "kanban", order: 1, tableId: tasksTable.id, config: JSON.stringify({ groupBy: statusField!.id }) } }),
  ]);

  const taskRows = [
    { title: "Set up authentication",     status: "Done",        assignee: "Alice",   due: "2026-02-15", priority: "High"     },
    { title: "Design dashboard layout",   status: "Done",        assignee: "Bob",     due: "2026-02-20", priority: "Medium"   },
    { title: "Build table component",     status: "In Progress", assignee: "Alice",   due: "2026-03-12", priority: "High"     },
    { title: "Add cell editing",          status: "In Progress", assignee: "Charlie", due: "2026-03-15", priority: "High"     },
    { title: "Write seed data",           status: "In Review",   assignee: "Bob",     due: "2026-03-10", priority: "Medium"   },
    { title: "Implement field types",     status: "Todo",        assignee: "Alice",   due: "2026-03-20", priority: "Critical" },
    { title: "Add row sorting",           status: "Todo",        assignee: "Charlie", due: "2026-03-22", priority: "Medium"   },
    { title: "Column resize handles",     status: "Todo",        assignee: "Bob",     due: "2026-03-25", priority: "Low"      },
    { title: "Export to CSV",             status: "Todo",        assignee: "Alice",   due: "2026-04-01", priority: "Low"      },
    { title: "Performance optimisation",  status: "Todo",        assignee: "Charlie", due: "2026-04-05", priority: "Medium"   },
  ];

  for (const [i, row] of taskRows.entries()) {
    const record = await prisma.record.create({ data: { order: i, tableId: tasksTable.id } });
    await Promise.all([
      prisma.cell.create({ data: { recordId: record.id, fieldId: titleField!.id,    value: row.title    } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: statusField!.id,   value: row.status   } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: assigneeField!.id, value: row.assignee } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: dueDateField!.id,  value: row.due      } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: priorityField!.id, value: row.priority } }),
    ]);
  }

  // Table: Team
  const teamTable = await prisma.table.create({
    data: { name: "Team", order: 1, baseId: projectBase.id },
  });

  const [memberNameField, roleField, emailField, departmentField] =
    await Promise.all([
      prisma.field.create({ data: { name: "Name",       type: "text",   order: 0, tableId: teamTable.id } }),
      prisma.field.create({ data: { name: "Role",       type: "text",   order: 1, tableId: teamTable.id } }),
      prisma.field.create({ data: { name: "Email",      type: "email",  order: 2, tableId: teamTable.id } }),
      prisma.field.create({ data: { name: "Department", type: "select", order: 3, tableId: teamTable.id, config: JSON.stringify({ options: ["Engineering", "Design", "Product", "Marketing"] }) } }),
    ]);

  await prisma.view.create({ data: { name: "All Members", type: "grid", order: 0, tableId: teamTable.id } });

  const teamRows = [
    { name: "Alice",   role: "Senior Engineer", email: "alice@example.com",   dept: "Engineering" },
    { name: "Bob",     role: "Product Designer", email: "bob@example.com",     dept: "Design"      },
    { name: "Charlie", role: "Backend Engineer", email: "charlie@example.com", dept: "Engineering" },
    { name: "Diana",   role: "Product Manager",  email: "diana@example.com",   dept: "Product"     },
  ];

  for (const [i, row] of teamRows.entries()) {
    const record = await prisma.record.create({ data: { order: i, tableId: teamTable.id } });
    await Promise.all([
      prisma.cell.create({ data: { recordId: record.id, fieldId: memberNameField!.id, value: row.name  } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: roleField!.id,       value: row.role  } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: emailField!.id,      value: row.email } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: departmentField!.id, value: row.dept  } }),
    ]);
  }

  // ─── Base 2: Content Calendar ──────────────────────────────────────────────
  const contentBase = await prisma.base.create({
    data: { name: "Content Calendar", createdById: user.id },
  });

  const postsTable = await prisma.table.create({
    data: { name: "Posts", order: 0, baseId: contentBase.id },
  });

  const [postTitleField, platformField, stageField, publishDateField, authorField] =
    await Promise.all([
      prisma.field.create({ data: { name: "Title",        type: "text",   order: 0, tableId: postsTable.id } }),
      prisma.field.create({ data: { name: "Platform",     type: "select", order: 1, tableId: postsTable.id, config: JSON.stringify({ options: ["Twitter", "LinkedIn", "Blog", "Instagram"] }) } }),
      prisma.field.create({ data: { name: "Stage",        type: "select", order: 2, tableId: postsTable.id, config: JSON.stringify({ options: ["Idea", "Draft", "Review", "Scheduled", "Published"] }) } }),
      prisma.field.create({ data: { name: "Publish Date", type: "date",   order: 3, tableId: postsTable.id } }),
      prisma.field.create({ data: { name: "Author",       type: "text",   order: 4, tableId: postsTable.id } }),
    ]);

  await Promise.all([
    prisma.view.create({ data: { name: "All Posts",    type: "grid",     order: 0, tableId: postsTable.id } }),
    prisma.view.create({ data: { name: "Calendar",     type: "calendar", order: 1, tableId: postsTable.id } }),
    prisma.view.create({ data: { name: "By Stage",     type: "kanban",   order: 2, tableId: postsTable.id, config: JSON.stringify({ groupBy: stageField!.id }) } }),
  ]);

  const postRows = [
    { title: "How we built our table component",   platform: "Blog",      stage: "Published", date: "2026-02-28", author: "Alice"   },
    { title: "5 tips for async remote teams",      platform: "LinkedIn",  stage: "Published", date: "2026-03-03", author: "Diana"   },
    { title: "Launch announcement thread",         platform: "Twitter",   stage: "Scheduled", date: "2026-03-15", author: "Bob"     },
    { title: "Behind the scenes: seed data",       platform: "Blog",      stage: "Review",    date: "2026-03-18", author: "Charlie" },
    { title: "What's new in v2",                   platform: "Blog",      stage: "Draft",     date: "2026-03-25", author: "Alice"   },
    { title: "Product update carousel",            platform: "Instagram", stage: "Draft",     date: "2026-03-28", author: "Bob"     },
    { title: "Engineering deep dive: tRPC",        platform: "Blog",      stage: "Idea",      date: "2026-04-05", author: "Charlie" },
    { title: "Q1 retrospective",                   platform: "LinkedIn",  stage: "Idea",      date: "2026-04-10", author: "Diana"   },
  ];

  for (const [i, row] of postRows.entries()) {
    const record = await prisma.record.create({ data: { order: i, tableId: postsTable.id } });
    await Promise.all([
      prisma.cell.create({ data: { recordId: record.id, fieldId: postTitleField!.id,  value: row.title    } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: platformField!.id,   value: row.platform } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: stageField!.id,      value: row.stage    } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: publishDateField!.id, value: row.date    } }),
      prisma.cell.create({ data: { recordId: record.id, fieldId: authorField!.id,     value: row.author   } }),
    ]);
  }

  console.log("✓ Seeded user:          ", user.email);
  console.log("✓ Seeded base:          ", projectBase.name, `(${taskRows.length} tasks, ${teamRows.length} team members)`);
  console.log("✓ Seeded base:          ", contentBase.name, `(${postRows.length} posts)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
