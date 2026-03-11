import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up old seed data...");
  await prisma.cell.deleteMany();
  await prisma.row.deleteMany();
  await prisma.column.deleteMany();
  await prisma.view.deleteMany();
  await prisma.table.deleteMany();
  await prisma.base.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding...");

  const user = await prisma.user.create({
    data: { email: "demo@example.com", name: "Demo User" },
  });

  // ─── Base: Project Tracker ──────────────────────────────────────────────────

  const baseProject = await prisma.base.create({
    data: { name: "Project Tracker", createdById: user.id },
  });

  const [tblTasks, tblTeam] = await Promise.all([
    prisma.table.create({ data: { name: "Tasks", order: 0, baseId: baseProject.id, createdById: user.id } }),
    prisma.table.create({ data: { name: "Team",  order: 1, baseId: baseProject.id, createdById: user.id } }),
  ]);

  // Tasks columns
  const [colTasksTitle, colTasksStatus, colTasksAssignee, colTasksDue, colTasksPriority] = await Promise.all([
    prisma.column.create({ data: { name: "Title",    type: "text",   order: 0, tableId: tblTasks.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Status",   type: "select", order: 1, tableId: tblTasks.id, createdById: user.id, config: JSON.stringify({ options: ["Todo", "In Progress", "In Review", "Done"] }) } }),
    prisma.column.create({ data: { name: "Assignee", type: "text",   order: 2, tableId: tblTasks.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Due Date", type: "date",   order: 3, tableId: tblTasks.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Priority", type: "select", order: 4, tableId: tblTasks.id, createdById: user.id, config: JSON.stringify({ options: ["Low", "Medium", "High", "Critical"] }) } }),
  ]);

  await Promise.all([
    prisma.view.create({ data: { name: "All Tasks",    type: "grid",   order: 0, tableId: tblTasks.id, createdById: user.id } }),
    prisma.view.create({ data: { name: "Kanban Board", type: "kanban", order: 1, tableId: tblTasks.id, createdById: user.id, config: JSON.stringify({ groupBy: colTasksStatus.id }) } }),
  ]);

  const taskData = [
    { title: "Set up authentication",    status: "Done",        assignee: "Alice",   due: "2026-02-15", priority: "High"     },
    { title: "Design dashboard layout",  status: "Done",        assignee: "Bob",     due: "2026-02-20", priority: "Medium"   },
    { title: "Build table component",    status: "In Progress", assignee: "Alice",   due: "2026-03-12", priority: "High"     },
    { title: "Add cell editing",         status: "In Progress", assignee: "Charlie", due: "2026-03-15", priority: "High"     },
    { title: "Write seed data",          status: "In Review",   assignee: "Bob",     due: "2026-03-10", priority: "Medium"   },
    { title: "Implement column types",   status: "Todo",        assignee: "Alice",   due: "2026-03-20", priority: "Critical" },
    { title: "Add row sorting",          status: "Todo",        assignee: "Charlie", due: "2026-03-22", priority: "Medium"   },
    { title: "Column resize handles",    status: "Todo",        assignee: "Bob",     due: "2026-03-25", priority: "Low"      },
    { title: "Export to CSV",            status: "Todo",        assignee: "Alice",   due: "2026-04-01", priority: "Low"      },
    { title: "Performance optimisation", status: "Todo",        assignee: "Charlie", due: "2026-04-05", priority: "Medium"   },
  ];

  for (const [i, d] of taskData.entries()) {
    const row = await prisma.row.create({ data: { order: i, tableId: tblTasks.id, createdById: user.id } });
    await Promise.all([
      prisma.cell.create({ data: { rowId: row.id, columnId: colTasksTitle.id,    value: d.title    } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTasksStatus.id,   value: d.status   } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTasksAssignee.id, value: d.assignee } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTasksDue.id,      value: d.due      } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTasksPriority.id, value: d.priority } }),
    ]);
  }

  // Team columns
  const [colTeamName, colTeamRole, colTeamEmail, colTeamDept] = await Promise.all([
    prisma.column.create({ data: { name: "Name",       type: "text",   order: 0, tableId: tblTeam.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Role",       type: "text",   order: 1, tableId: tblTeam.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Email",      type: "email",  order: 2, tableId: tblTeam.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Department", type: "select", order: 3, tableId: tblTeam.id, createdById: user.id, config: JSON.stringify({ options: ["Engineering", "Design", "Product", "Marketing"] }) } }),
  ]);

  await prisma.view.create({ data: { name: "All Members", type: "grid", order: 0, tableId: tblTeam.id, createdById: user.id } });

  const teamData = [
    { name: "Alice",   role: "Senior Engineer",  email: "alice@example.com",   dept: "Engineering" },
    { name: "Bob",     role: "Product Designer", email: "bob@example.com",     dept: "Design"      },
    { name: "Charlie", role: "Backend Engineer", email: "charlie@example.com", dept: "Engineering" },
    { name: "Diana",   role: "Product Manager",  email: "diana@example.com",   dept: "Product"     },
  ];

  for (const [i, d] of teamData.entries()) {
    const row = await prisma.row.create({ data: { order: i, tableId: tblTeam.id, createdById: user.id } });
    await Promise.all([
      prisma.cell.create({ data: { rowId: row.id, columnId: colTeamName.id,  value: d.name  } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTeamRole.id,  value: d.role  } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTeamEmail.id, value: d.email } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colTeamDept.id,  value: d.dept  } }),
    ]);
  }

  // ─── Base: Content Calendar ─────────────────────────────────────────────────

  const baseContent = await prisma.base.create({
    data: { name: "Content Calendar", createdById: user.id },
  });

  const tblPosts = await prisma.table.create({
    data: { name: "Posts", order: 0, baseId: baseContent.id, createdById: user.id },
  });

  const [colPostsTitle, colPostsPlatform, colPostsStage, colPostsDate, colPostsAuthor] = await Promise.all([
    prisma.column.create({ data: { name: "Title",        type: "text",   order: 0, tableId: tblPosts.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Platform",     type: "select", order: 1, tableId: tblPosts.id, createdById: user.id, config: JSON.stringify({ options: ["Twitter", "LinkedIn", "Blog", "Instagram"] }) } }),
    prisma.column.create({ data: { name: "Stage",        type: "select", order: 2, tableId: tblPosts.id, createdById: user.id, config: JSON.stringify({ options: ["Idea", "Draft", "Review", "Scheduled", "Published"] }) } }),
    prisma.column.create({ data: { name: "Publish Date", type: "date",   order: 3, tableId: tblPosts.id, createdById: user.id } }),
    prisma.column.create({ data: { name: "Author",       type: "text",   order: 4, tableId: tblPosts.id, createdById: user.id } }),
  ]);

  await Promise.all([
    prisma.view.create({ data: { name: "All Posts", type: "grid",     order: 0, tableId: tblPosts.id, createdById: user.id } }),
    prisma.view.create({ data: { name: "Calendar",  type: "calendar", order: 1, tableId: tblPosts.id, createdById: user.id } }),
    prisma.view.create({ data: { name: "By Stage",  type: "kanban",   order: 2, tableId: tblPosts.id, createdById: user.id, config: JSON.stringify({ groupBy: colPostsStage.id }) } }),
  ]);

  const postsData = [
    { title: "How we built our table component",  platform: "Blog",      stage: "Published", date: "2026-02-28", author: "Alice"   },
    { title: "5 tips for async remote teams",     platform: "LinkedIn",  stage: "Published", date: "2026-03-03", author: "Diana"   },
    { title: "Launch announcement thread",        platform: "Twitter",   stage: "Scheduled", date: "2026-03-15", author: "Bob"     },
    { title: "Behind the scenes: seed data",      platform: "Blog",      stage: "Review",    date: "2026-03-18", author: "Charlie" },
    { title: "What's new in v2",                  platform: "Blog",      stage: "Draft",     date: "2026-03-25", author: "Alice"   },
    { title: "Product update carousel",           platform: "Instagram", stage: "Draft",     date: "2026-03-28", author: "Bob"     },
    { title: "Engineering deep dive: tRPC",       platform: "Blog",      stage: "Idea",      date: "2026-04-05", author: "Charlie" },
    { title: "Q1 retrospective",                  platform: "LinkedIn",  stage: "Idea",      date: "2026-04-10", author: "Diana"   },
  ];

  for (const [i, d] of postsData.entries()) {
    const row = await prisma.row.create({ data: { order: i, tableId: tblPosts.id, createdById: user.id } });
    await Promise.all([
      prisma.cell.create({ data: { rowId: row.id, columnId: colPostsTitle.id,    value: d.title    } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colPostsPlatform.id, value: d.platform } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colPostsStage.id,    value: d.stage    } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colPostsDate.id,     value: d.date     } }),
      prisma.cell.create({ data: { rowId: row.id, columnId: colPostsAuthor.id,   value: d.author   } }),
    ]);
  }

  console.log(`✓ user:   ${user.id}`);
  console.log(`✓ bases:  ${baseProject.id}, ${baseContent.id}`);
  console.log(`✓ tables: ${tblTasks.id} (${taskData.length} rows)  ${tblTeam.id} (${teamData.length} rows)  ${tblPosts.id} (${postsData.length} rows)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
