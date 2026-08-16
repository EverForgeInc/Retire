import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, KpiCard, Panel } from "@/components/ui/Panel";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardForPage } from "@/lib/server-data";
import { prisma } from "@/lib/db";
import { compareLocationCash } from "@/lib/rules/income";
import { cn, formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const firstName = (dashboard.profile.fullName || ctx.user.displayName || "there").split(" ")[0];

  const income = await prisma.incomeScenario.findFirst({
    where: { memberProfileId: ctx.profile!.id },
    include: {
      locations: {
        include: { location: { include: { costVersions: { where: { approved: true } } } } },
      },
    },
  });
  const topLocation = income?.locations
    .map((sel) => {
      const expenses = {
        ...Object.fromEntries(sel.location.costVersions.map((c) => [c.category, c.amountUsd ?? 0])),
        ...JSON.parse(sel.customExpenses || "{}"),
      };
      const cash = compareLocationCash(
        {
          estimatedRetiredPay: income.estimatedRetiredPay ?? 0,
          memberVaPay: income.memberVaPay ?? 0,
        },
        expenses,
      );
      return {
        label: `${sel.location.city}${sel.location.region ? `, ${sel.location.region}` : ""}`,
        ...cash,
        totalIncome: (income.estimatedRetiredPay ?? 0) + (income.memberVaPay ?? 0),
      };
    })
    .sort((a, b) => b.remainingMonthlyCash - a.remainingMonthlyCash)[0];

  const vaConditions = await prisma.vaCondition.count({
    where: { memberProfileId: ctx.profile!.id },
  });

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Good morning, ${firstName}`}
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard
          label="Days to retirement"
          value={dashboard.metrics.daysToRetirement}
          hint={dashboard.profile.projectedRetirementDate}
          href="/timeline"
        />
        <KpiCard
          label="Overall progress"
          value={`${dashboard.metrics.progressPercent}%`}
          hint={`${dashboard.metrics.completeCount} of ${dashboard.metrics.applicableCount} tasks`}
          href="/checklist"
        />
        <KpiCard label="Tasks due" value={dashboard.metrics.dueSoonCount} hint="Next 7 days" href="/checklist" />
        <KpiCard
          label="Overdue tasks"
          value={dashboard.metrics.overdueCount}
          hint="Require attention"
          accent="danger"
          href="/checklist?status=overdue"
        />
        <KpiCard
          label="Waiting on others"
          value={dashboard.metrics.waitingCount}
          hint="In progress"
          href="/checklist?status=waiting"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Current phase">
          <p className="text-lg font-semibold text-slate-900">
            Phase {dashboard.currentPhase.phase} of {dashboard.currentPhase.totalPhases}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{dashboard.currentPhase.label}</p>
          <Progress value={dashboard.currentPhase.percent} className="mt-4 w-full gap-0" />
          <p className="mt-2 text-xs text-muted-foreground">
            {dashboard.currentPhase.complete}/{dashboard.currentPhase.total} tasks complete (
            {dashboard.currentPhase.percent}%)
          </p>
        </Panel>

        <Panel
          title="Upcoming tasks"
          action={
            <Link href="/checklist" className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 text-xs")}>
              View all
            </Link>
          }
        >
          {dashboard.upcomingTasks.length === 0 ? (
            <EmptyState title="No upcoming tasks" description="You are caught up for now." />
          ) : (
            <ul className="space-y-3">
              {dashboard.upcomingTasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-border/70 px-3 py-2">
                  <Link href={`/checklist/${task.id}`} className="block">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.calculatedEnd ? `Due ${task.calculatedEnd}` : "Open window"}</span>
                      <StatusChip status={task.status === "waiting" ? "waiting" : "upcoming"} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Timeline overview">
          <ul className="space-y-3 text-sm">
            {dashboard.profile.skillbridgeStart ? (
              <li>
                <div className="font-medium">SkillBridge</div>
                <div className="text-muted-foreground">
                  {dashboard.profile.skillbridgeStart} to {dashboard.profile.skillbridgeEnd}
                </div>
              </li>
            ) : null}
            {dashboard.profile.terminalLeaveStart ? (
              <li>
                <div className="font-medium">Terminal leave</div>
                <div className="text-muted-foreground">{dashboard.profile.terminalLeaveStart}</div>
              </li>
            ) : null}
            {dashboard.profile.finalDutyDay ? (
              <li>
                <div className="font-medium">Final duty day</div>
                <div className="text-muted-foreground">{dashboard.profile.finalDutyDay}</div>
              </li>
            ) : null}
            <li>
              <div className="font-medium text-emerald-700">Retirement date</div>
              <div className="text-muted-foreground">{dashboard.profile.projectedRetirementDate}</div>
            </li>
          </ul>
          <Button className="mt-4" render={<Link href="/timeline" />}>
            Open timeline calendar
          </Button>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Income scenario">
          {income && topLocation ? (
            <>
              <p className="text-2xl font-semibold">{formatCurrency(topLocation.totalIncome)}</p>
              <p className="text-sm text-muted-foreground">Projected monthly income</p>
              <p className="mt-3 text-lg font-semibold text-emerald-700">
                {formatCurrency(topLocation.remainingMonthlyCash)} remaining
              </p>
              <p className="text-xs text-muted-foreground">After expenses in {topLocation.label}</p>
              <Link href="/income" className={cn(buttonVariants({ variant: "link" }), "mt-3 h-auto px-0")}>
                Open income planner
              </Link>
            </>
          ) : (
            <EmptyState
              title="No income scenario yet"
              action={
                <Link href="/income" className={buttonVariants()}>
                  Review income planner
                </Link>
              }
            />
          )}
        </Panel>
        <Panel title="Top location match">
          {topLocation ? (
            <>
              <p className="text-xl font-semibold">{topLocation.label}</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>Affordability considered</li>
                <li>VA access considered</li>
                <li>Quality of life considered</li>
              </ul>
              <Link href="/locations" className={cn(buttonVariants({ variant: "link" }), "mt-3 h-auto px-0")}>
                Compare locations
              </Link>
            </>
          ) : (
            <EmptyState title="No location ranking yet" />
          )}
        </Panel>
        <Panel title="VA claim status">
          <p className="text-3xl font-semibold">{vaConditions}</p>
          <p className="text-sm text-muted-foreground">Tracked conditions</p>
          <Link href="/va" className={cn(buttonVariants({ variant: "link" }), "mt-4 h-auto px-0")}>
            Open VA tracker
          </Link>
        </Panel>
      </div>

      <Panel title="Checklist progress by phase" className="mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dashboard.sections.map((section) => (
            <Link
              key={section.sectionId}
              href={`/checklist?view=phase&sectionId=${section.sectionId}`}
              className={cn(
                "min-w-28 rounded-xl px-3 py-2 text-center text-xs transition",
                section.isActive ? "bg-blue-600 text-white" : "bg-muted text-slate-700 hover:bg-muted/80",
              )}
            >
              <div className="font-semibold">Phase {section.phase}</div>
              <div className="mt-1 opacity-80">{section.percent}%</div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Tasks due this week" className="mt-4" contentClassName="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5">Task</TableHead>
              <TableHead className="px-5">Phase</TableHead>
              <TableHead className="px-5">Due</TableHead>
              <TableHead className="px-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboard.dueThisWeek.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-5 text-muted-foreground">
                  No tasks due in the next 7 days.
                </TableCell>
              </TableRow>
            ) : (
              dashboard.dueThisWeek.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-5">
                    <Link href={`/checklist/${task.id}`} className="font-medium hover:text-blue-700">
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 text-muted-foreground">{task.sectionName}</TableCell>
                  <TableCell className="px-5 text-muted-foreground">{task.calculatedEnd}</TableCell>
                  <TableCell className="px-5">
                    <StatusChip status="due_soon" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Panel>
    </AppShell>
  );
}
