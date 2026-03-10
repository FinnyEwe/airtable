import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

// ─── IDs ──────────────────────────────────────────────────────────────────────

const USER      = "user_demo";

const BASE_PROJECT = "base_project";
const BASE_CONTENT = "base_content";

const TBL_TASKS = "tbl_tasks";
const TBL_TEAM  = "tbl_team";
const TBL_POSTS = "tbl_posts";

const COL_TASKS_TITLE    = "col_tasks_title";
const COL_TASKS_STATUS   = "col_tasks_status";
const COL_TASKS_ASSIGNEE = "col_tasks_assignee";
const COL_TASKS_DUE      = "col_tasks_due";
const COL_TASKS_PRIORITY = "col_tasks_priority";

const COL_TEAM_NAME  = "col_team_name";
const COL_TEAM_ROLE  = "col_team_role";
const COL_TEAM_EMAIL = "col_team_email";
const COL_TEAM_DEPT  = "col_team_dept";

const COL_POSTS_TITLE    = "col_posts_title";
const COL_POSTS_PLATFORM = "col_posts_platform";
const COL_POSTS_STAGE    = "col_posts_stage";
const COL_POSTS_DATE     = "col_posts_date";
const COL_POSTS_AUTHOR   = "col_posts_author";

const VIEW_TASKS_GRID   = "view_tasks_grid";
const VIEW_TASKS_KANBAN = "view_tasks_kanban";
const VIEW_TEAM_GRID    = "view_team_grid";
const VIEW_POSTS_GRID   = "view_posts_grid";
const VIEW_POSTS_CAL    = "view_posts_cal";
const VIEW_POSTS_STAGE  = "view_posts_stage";

// ─── Seed ─────────────────────────────────────────────────────────────────────

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

  await prisma.user.create({
    data: { id: USER, email: "demo@example.com", name: "Demo User" },
  });

  // ─── Base: Project Tracker ──────────────────────────────────────────────────

  await prisma.base.create({ data: { id: BASE_PROJECT, name: "Project Tracker", createdById: USER } });

  await Promise.all([
    prisma.table.create({ data: { id: TBL_TASKS, name: "Tasks", order: 0, baseId: BASE_PROJECT, createdById: USER } }),
    prisma.table.create({ data: { id: TBL_TEAM,  name: "Team",  order: 1, baseId: BASE_PROJECT, createdById: USER } }),
  ]);

  // Tasks columns
  await Promise.all([
    prisma.column.create({ data: { id: COL_TASKS_TITLE,    name: "Title",    type: "text",   order: 0, tableId: TBL_TASKS, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TASKS_STATUS,   name: "Status",   type: "select", order: 1, tableId: TBL_TASKS, createdById: USER, config: JSON.stringify({ options: ["Todo", "In Progress", "In Review", "Done"] }) } }),
    prisma.column.create({ data: { id: COL_TASKS_ASSIGNEE, name: "Assignee", type: "text",   order: 2, tableId: TBL_TASKS, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TASKS_DUE,      name: "Due Date", type: "date",   order: 3, tableId: TBL_TASKS, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TASKS_PRIORITY, name: "Priority", type: "select", order: 4, tableId: TBL_TASKS, createdById: USER, config: JSON.stringify({ options: ["Low", "Medium", "High", "Critical"] }) } }),
  ]);

  await Promise.all([
    prisma.view.create({ data: { id: VIEW_TASKS_GRID,   name: "All Tasks",    type: "grid",   order: 0, tableId: TBL_TASKS, createdById: USER } }),
    prisma.view.create({ data: { id: VIEW_TASKS_KANBAN, name: "Kanban Board", type: "kanban", order: 1, tableId: TBL_TASKS, createdById: USER, config: JSON.stringify({ groupBy: COL_TASKS_STATUS }) } }),
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
    const rowId = `row_tasks_${i + 1}`;
    await prisma.row.create({ data: { id: rowId, order: i, tableId: TBL_TASKS, createdById: USER } });
    await Promise.all([
      prisma.cell.create({ data: { rowId, columnId: COL_TASKS_TITLE,    value: d.title    } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TASKS_STATUS,   value: d.status   } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TASKS_ASSIGNEE, value: d.assignee } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TASKS_DUE,      value: d.due      } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TASKS_PRIORITY, value: d.priority } }),
    ]);
  }

  // Team columns
  await Promise.all([
    prisma.column.create({ data: { id: COL_TEAM_NAME,  name: "Name",       type: "text",   order: 0, tableId: TBL_TEAM, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TEAM_ROLE,  name: "Role",       type: "text",   order: 1, tableId: TBL_TEAM, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TEAM_EMAIL, name: "Email",      type: "email",  order: 2, tableId: TBL_TEAM, createdById: USER } }),
    prisma.column.create({ data: { id: COL_TEAM_DEPT,  name: "Department", type: "select", order: 3, tableId: TBL_TEAM, createdById: USER, config: JSON.stringify({ options: ["Engineering", "Design", "Product", "Marketing"] }) } }),
  ]);

  await prisma.view.create({ data: { id: VIEW_TEAM_GRID, name: "All Members", type: "grid", order: 0, tableId: TBL_TEAM, createdById: USER } });

  const teamData = [
    { name: "Alice",   role: "Senior Engineer",  email: "alice@example.com",   dept: "Engineering" },
    { name: "Bob",     role: "Product Designer", email: "bob@example.com",     dept: "Design"      },
    { name: "Charlie", role: "Backend Engineer", email: "charlie@example.com", dept: "Engineering" },
    { name: "Diana",   role: "Product Manager",  email: "diana@example.com",   dept: "Product"     },
  ];

  for (const [i, d] of teamData.entries()) {
    const rowId = `row_team_${i + 1}`;
    await prisma.row.create({ data: { id: rowId, order: i, tableId: TBL_TEAM, createdById: USER } });
    await Promise.all([
      prisma.cell.create({ data: { rowId, columnId: COL_TEAM_NAME,  value: d.name  } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TEAM_ROLE,  value: d.role  } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TEAM_EMAIL, value: d.email } }),
      prisma.cell.create({ data: { rowId, columnId: COL_TEAM_DEPT,  value: d.dept  } }),
    ]);
  }

  // ─── Base: Content Calendar ─────────────────────────────────────────────────

  await prisma.base.create({ data: { id: BASE_CONTENT, name: "Content Calendar", createdById: USER } });
  await prisma.table.create({ data: { id: TBL_POSTS, name: "Posts", order: 0, baseId: BASE_CONTENT, createdById: USER } });

  await Promise.all([
    prisma.column.create({ data: { id: COL_POSTS_TITLE,    name: "Title",        type: "text",   order: 0, tableId: TBL_POSTS, createdById: USER } }),
    prisma.column.create({ data: { id: COL_POSTS_PLATFORM, name: "Platform",     type: "select", order: 1, tableId: TBL_POSTS, createdById: USER, config: JSON.stringify({ options: ["Twitter", "LinkedIn", "Blog", "Instagram"] }) } }),
    prisma.column.create({ data: { id: COL_POSTS_STAGE,    name: "Stage",        type: "select", order: 2, tableId: TBL_POSTS, createdById: USER, config: JSON.stringify({ options: ["Idea", "Draft", "Review", "Scheduled", "Published"] }) } }),
    prisma.column.create({ data: { id: COL_POSTS_DATE,     name: "Publish Date", type: "date",   order: 3, tableId: TBL_POSTS, createdById: USER } }),
    prisma.column.create({ data: { id: COL_POSTS_AUTHOR,   name: "Author",       type: "text",   order: 4, tableId: TBL_POSTS, createdById: USER } }),
  ]);

  await Promise.all([
    prisma.view.create({ data: { id: VIEW_POSTS_GRID,  name: "All Posts", type: "grid",     order: 0, tableId: TBL_POSTS, createdById: USER } }),
    prisma.view.create({ data: { id: VIEW_POSTS_CAL,   name: "Calendar",  type: "calendar", order: 1, tableId: TBL_POSTS, createdById: USER } }),
    prisma.view.create({ data: { id: VIEW_POSTS_STAGE, name: "By Stage",  type: "kanban",   order: 2, tableId: TBL_POSTS, createdById: USER, config: JSON.stringify({ groupBy: COL_POSTS_STAGE }) } }),
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
    const rowId = `row_posts_${i + 1}`;
    await prisma.row.create({ data: { id: rowId, order: i, tableId: TBL_POSTS, createdById: USER } });
    await Promise.all([
      prisma.cell.create({ data: { rowId, columnId: COL_POSTS_TITLE,    value: d.title    } }),
      prisma.cell.create({ data: { rowId, columnId: COL_POSTS_PLATFORM, value: d.platform } }),
      prisma.cell.create({ data: { rowId, columnId: COL_POSTS_STAGE,    value: d.stage    } }),
      prisma.cell.create({ data: { rowId, columnId: COL_POSTS_DATE,     value: d.date     } }),
      prisma.cell.create({ data: { rowId, columnId: COL_POSTS_AUTHOR,   value: d.author   } }),
    ]);
  }

  console.log(`✓ user:   ${USER}`);
  console.log(`✓ bases:  ${BASE_PROJECT}, ${BASE_CONTENT}`);
  console.log(`✓ tables: ${TBL_TASKS} (${taskData.length} rows)  ${TBL_TEAM} (${teamData.length} rows)  ${TBL_POSTS} (${postsData.length} rows)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
