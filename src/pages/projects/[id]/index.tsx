import React, { useEffect } from "react";
import format from "date-fns/format";
import { useRouter } from "next/router";
import Link from "next/link";
import { removeRun, Run } from "src/api";
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  Title,
  Card,
  Table,
  Badge,
  MenuIcon,
  Spinner,
  PieChart,
  AreaChart,
  Select,
  Option,
} from "src/components";
import {
  ClockIcon,
  TagSolidIcon,
  ExclamationSolidIcon,
} from "src/components";
import { ProtectRoute, useAlert, useNotification } from "src/context";
import { usePagination, useProject, useRuns } from "src/utils/hooks";
import { config } from "src/utils/tailwind";
import { customFormatDuration, getTotalBy } from "src/utils";

function DataDisplayWrapper(props) {
  return <div className="flex flex-wrap mt-4 -mx-6" {...props} />;
}

function DataDisplay({ label, value }) {
  return (
    <div className="flex flex-col my-3 mx-6 xs:w-full">
      <div className="font-medium text-xs uppercase tracking-wider leading-none text-gray-500">
        {label}
      </div>
      <div className="mt-2 font-medium text-2xl leading-none">{value}</div>
    </div>
  );
}

function Caption(props) {
  return <div className="mt-1 text-xs text-gray-500 font-medium" {...props} />;
}

function RunsTable() {
  const { query, route, asPath } = useRouter();
  const { mutateProject } = useProject(query.id as string);
  const [filters, setFilters] = React.useState({
    projectId: query.id as string,
    page: 0,
    size: 5,
  });
  const { runs, isLoading: isLoadingRuns, mutateRuns } = useRuns(filters);
  const { PaginationComponent, currentPage } = usePagination<Run[]>({
    paginatedObject: runs,
  });

  React.useEffect(() => {
    setFilters({ ...filters, page: currentPage });
  }, [currentPage]);

  const alert = useAlert();
  const notitication = useNotification();

  const handleDeleteRun = ({ name, id }) => (e) => {
    const onConfirm = async () => {
      try {
        await removeRun(id);
        mutateProject();
        mutateRuns();
        notitication.show({
          title: "Exito",
          type: "success",
          message: `El run ${name} ha sido eliminado correctamente.`,
        });
      } catch (error) {
        notitication.show({
          title: "Error",
          type: "error",
          message: `Se produjo un error al intentar eliminar el run. Intente mas tarde.`,
        });
      }
    };

    alert.show({
      title: `Eliminar ${name}`,
      body:
        "Estas seguro que quieres eliminarlo? Se perderan todos los datos asociados.",
      onConfirm,
      action: "Eliminar",
    });
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Run",
        id: "name",
        Cell: ({ row }) => {
          const { name, duration, id } = row.original;
          return (
            <div className="flex flex-col text-sm">
              <Link href={`${asPath}/runs/${id}`}>
                <a className="text-sm leading-5 font-medium text-gray-900 hover:text-gray-700 underline">
                  {name}
                </a>
              </Link>
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 text-gray-500 mr-2">
                    <ClockIcon />
                  </div>
                  <span
                    className="block text-gray-500 text-sm"
                    title="Duration"
                  >
                    {customFormatDuration({ start: 0, end: duration })}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        Header: "Status",
        id: "status",
        Cell: ({ row }) => (
          <Badge
            label={row.original.status}
            color={row.original.status === "pass" ? "green" : "red"}
          />
        ),
      },
      {
        Header: "Start time",
        id: "start_time",
        Cell: ({ row }) => (
          <span
            className="text-sm leading-5 text-gray-500"
            title={row.original.created}
          >
            {format(new Date(row.original.startTime), "dd/MM/yyyy HH:ss")}
          </span>
        ),
      },
      {
        Header: "Total features",
        id: "total_features",
        headerClassName: "text-right",
        className: "text-right",
        Cell: ({ row }) => (
          <span className="text-sm leading-5 text-gray-500">
            {getTotalBy("feature", row.original)}
          </span>
        ),
      },
      {
        Header: "Total scenarios",
        id: "total_scenarios",
        headerClassName: "text-right",
        className: "text-right",
        Cell: ({ row }) => (
          <span className="text-sm leading-5 text-gray-500">
            {getTotalBy("scenario", row.original)}
          </span>
        ),
      },
      {
        Header: "Passed",
        id: "passed",
        headerClassName: "text-right",
        className: "text-right text-sm leading-5 text-green-600",
        accessor: "passChildLength",
      },
      {
        Header: "Failed",
        id: "failed",
        headerClassName: "text-right",
        className: "text-right text-sm leading-5 text-red-600 text-center",
        accessor: "failChildLength",
      },
      {
        Header: "Skipped",
        id: "skipped",
        headerClassName: "text-right",
        className: "text-right text-sm leading-5 text-yellow-600 text-center",
        accessor: "skipChildLength",
      },
      {
        Header: () => null,
        id: "edit",
        Cell: ({ row }) => (
          <MenuIcon
            items={[
              [{ label: "Eliminar", onClick: handleDeleteRun(row.original) }],
            ]}
          />
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-1">
        {isLoadingRuns ? (
          <div className="flex-center flex-1">
            <Spinner className="h-10 w-10 text-gray-500" />
          </div>
        ) : (
          <Table {...{ columns }} data={runs?.content} sticky />
        )}
      </div>
      {PaginationComponent}
    </>
  );
}

function GeneralCard() {
  const { query } = useRouter();
  const { project } = useProject(query.id as string);

  const {
    createdAt,
    runQuantity,
    testQuantity,
    errorState,
    lastRun: { categoryNameList = [] } = {},
  } = project ?? {};

  return (
    <Card className="flex-col w-1/3 border-r divide-y">
      <div className="flex-1 p-6">
        <Title className="text-gray-700 font-semibold">General</Title>
        <Caption>
          Creado el {format(new Date(createdAt || null), "dd/MM/yyyy HH:ss")}
        </Caption>
        <DataDisplayWrapper>
          <DataDisplay label="Project Runs" value={runQuantity} />
          <DataDisplay label="Project Tests" value={testQuantity} />
        </DataDisplayWrapper>
      </div>
      <div className="flex-1 p-6">
        <Title className="text-gray-700 font-semibold">Tags</Title>
        <div className="flex flex-wrap mt-4 -mx-2">
          {categoryNameList?.map((tag) => (
            <Badge
              key={tag}
              IconComponent={
                <div className="text-gray-700 w-3 h-3 mr-2">
                  <TagSolidIcon />
                </div>
              }
              className="m-2"
              uppercase={false}
              color="gray"
              label={tag}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Title className="text-gray-700 font-semibold">Excepciones</Title>
        <div className="flex flex-wrap mt-4 -mx-2">
          {errorState?.map((error) => (
            <Badge
              key={error}
              IconComponent={
                <div className="text-red-700 w-3 h-3 mr-2">
                  <ExclamationSolidIcon />
                </div>
              }
              className="m-2"
              uppercase={false}
              color="red"
              label={error}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function LastRunCard() {
  const { query } = useRouter();
  const { project } = useProject(query.id as string);
  const [runFilter, setRunFilter] = React.useState<Option>({
    label: "Feature",
    value: "Parent",
  });

  const pieChartData = [
    {
      name: "Pass",
      value: project?.lastRun[`pass${runFilter.value}Length`],
      color: "green",
    },
    {
      name: "Fail",
      value: project?.lastRun[`fail${runFilter.value}Length`],
      color: "red",
    },
  ];

  const { lastRun: { startTime = "", status = "" } = {} } = project ?? {};

  return (
    <Card className="flex-col w-1/3 border-r p-6">
      <div className="flex flex-col">
        <div className="inline-flex justify-between">
          <div>
            <Title className="text-gray-700 font-semibold">Ultimo run</Title>
            <Badge
              className="ml-2"
              label={status}
              color={status === "pass" ? "green" : "red"}
            />
          </div>
          <div className="w-1/3">
            <Select
              name="filter"
              options={[
                { label: "Feature", value: "Parent" },
                { label: "Scenario", value: "Child" },
              ]}
              selected={runFilter}
              onSelect={(option) => setRunFilter(option)}
            />
          </div>
        </div>
        <Caption>
          Iniciado el {format(new Date(startTime || null), "dd/MM/yyyy HH:ss")}
        </Caption>
      </div>
      <DataDisplayWrapper>
        <DataDisplay
          label="Total features"
          value={getTotalBy("feature", project?.lastRun)}
        />
        <DataDisplay
          label="Total scenarios"
          value={getTotalBy("scenario", project?.lastRun)}
        />
        <DataDisplay
          label="Total steps"
          value={getTotalBy("steps", project?.lastRun)}
        />
      </DataDisplayWrapper>
      <div className="flex-center">
        <PieChart height={250} data={pieChartData} />
      </div>
    </Card>
  );
}

function FailuresCard() {
  const { query } = useRouter();
  const { runs } = useRuns({
    projectId: query.id as string,
  });

  const size = runs?.content.length > 10 ? 10 : runs?.content.length;
  const data = runs?.content.slice(0, 10).map((run, idx) => ({
    idx,
    name: run.name,
    value: run.failChildLength,
  }));

  return (
    <Card className="flex-col w-1/3 p-6">
      <Title className="text-gray-700 font-semibold">Fallos</Title>
      <Caption>De los ultimos {size} runs</Caption>
      <div className="flex-center flex-1">
        <AreaChart
          data={data}
          xAxisDataKey="idx"
          height={300}
          AreaProps={{
            dataKey: "value",
            fill: config.theme.colors.red[600],
            stroke: config.theme.colors.red[700],
          }}
        />
      </div>
    </Card>
  );
}

function Project() {
  const { query, asPath } = useRouter();
  const { project } = useProject(query.id as string);
  const { runs } = useRuns({
    projectId: query.id as string,
  });

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex p-4 space-x-4">
          <nav className="container">
            <ol className="flex text-grey">
              {project?.name !== undefined &&
              <li className="px-2"><a href={asPath} className="cursor-pointer font-semibold">{`${project?.name}`}</a></li>}
            </ol>
          </nav>
        </div>
      </LayoutHeader>
      <LayoutContent scrollable>
        <div className="flex border-b">
          <GeneralCard />
          <LastRunCard />
          <FailuresCard />
        </div>
        <RunsTable />
      </LayoutContent>
    </Layout>
  );
}

export default ProtectRoute(Project);
