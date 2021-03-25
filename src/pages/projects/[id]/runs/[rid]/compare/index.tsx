import { useRouter } from "next/router";
import format from "date-fns/format";
import React, { useEffect, useState } from "react";
import { Layout, LayoutHeader, Badge, TagSolidIcon, Spinner, CheckCircleIcon, CrossCircleIcon, MediaModal } from "src/components";
import { ProtectRoute } from "src/context";
import { customFormatDuration, useFeatures, useProject, useRuns, useTests } from "src/utils";
import classNames from "classnames";

// @ts-ignore
const TestContext = React.createContext();

function TestProvider(props) {
  const [test, setTest] = React.useState({
    test1:{id:[], name:'', steps:[], description:'', duration:'', tags:[]}, 
    test2:{id:[], name:'', steps:[], description:'', duration:'', tags:[]},
  });
  const value = { test, setTest };
  return <TestContext.Provider value={value} {...props} />;
}

function useTest() {
  const context = React.useContext(TestContext);
  if (!context) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return context;
}

function Logs({ logs }) {
  return logs?.map(({ test, status, details, media }) => (
    <React.Fragment key={test}>
      {details != "" ? (
        <li
          key={test}
          className="flex items-center text-sm"
          dangerouslySetInnerHTML={{ __html: details }}
        ></li>
      ) : (
        ""
      )}

      {media != null
        ? media?.map(() => (
            <li key={test} className="flex items-center text-sm">
              <MediaModal {...{ testId: test }} />
            </li>
          ))
        : ""}
    </React.Fragment>
  ));
}

function Step({ status, name, logs }) {
  return (
    <React.Fragment>
      <li className="flex items-center text-sm">
        <div
          className={classNames(
            { "text-red-600": status === "fail" },
            { "text-green-600": status === "pass" },
            "w-5",
            "h-5",
            "mr-2"
          )}
        >
          {status === "pass" ? <CheckCircleIcon /> : <CrossCircleIcon />}
        </div>
        {name}
      </li>

      {logs.length > 0 ? <Logs {...{ logs }} /> : ""}
    </React.Fragment>
  );
}

function StepWrapper({ children }) {
  return <ul className="space-y-2 py-4">{children}</ul>;
}

function StepsCard({ steps = [] }) {
  return  (
    <div className="mt-4 border border-gray-300 rounded-md p-4">
      <StepWrapper>
        {steps?.map(({ id, status, name, logs }) => (
          <Step key={id} {...{ id, status, name, logs }} />
        ))}
      </StepWrapper>
    </div>
  )
}

function TestCard({name, steps, description, tags, formattedDuration}) {
  console.log(steps);
  console.log(tags);
  return (
    <>
      {name && (
        <>
          <div className="w-full">
            <span>{name}</span>
            {tags?.map((tag) => (
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
            <span className="block text-gray-500 text-sm" title="Duration">{formattedDuration}</span>
          </div>
          <div className="m-2">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
          {steps?.length !== 0 && <StepsCard steps={steps} />}
        </>
      )}
    </>
  )
}

function Test1() {
  // @ts-ignore
  const { test } = useTest();
  const {id, name, steps, description, duration, tags} = test?.test1
  const formattedDuration = customFormatDuration({ start: 0, end: duration });
  
  return (
    <>
      {id && (
          <div className="float-left w-1/2 p-2">
            <TestCard name={name} description={description} steps={steps} tags={tags} formattedDuration={formattedDuration}/>
          </div>
      )}
    </>
  )
}

function Test2() {
  // @ts-ignore
  const { test } = useTest();
  const {id, name, steps, description, duration, tags} = test?.test2
  const formattedDuration = customFormatDuration({ start: 0, end: duration });

  return (
    <>
      {id && (
          <div className="float-right w-1/2 p-2">
            <TestCard name={name} description={description} steps={steps} tags={tags} formattedDuration={formattedDuration}/>
          </div>
      )}
    </>
  )
}

function Content() {
  
  return (
    <div className="w-full h-full overflow-y-auto">
      <Test1 />
      <Test2 />
    </div>
  )
}

function ScenarioItem({id, name, steps, status, description, duration, tags}) {
  const count1 = Math.random();
  const count2 = Math.random();

  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)

  const handleCheckbox1 = (e) => {
    setChecked1(e.target.checked);
  };

  const handleCheckbox2 = (e) => {
    setChecked2(e.target.checked);
  };


  // @ts-ignore
  const { test, setTest } = useTest();

  const handleTest1 = (id, name, steps, description, duration, tags) => {
    if (!checked1) {
      setTest({...test, test1:{id:id, name:name, steps:steps, description:description, duration:duration, tags:tags}})
    } else {
      setTest({...test, test1:{id:[], name:'', steps:[], description:'', duration:'', tags:[]}})
    }
  }
  const handleTest2 = (id, name, steps, description, duration, tags) => {
    if (!checked2) {
      setTest({...test, test2:{id:id, name:name, steps:steps, description:description, duration:duration, tags:tags}})
    } else {
      setTest({...test, test2:{id:[], name:'', steps:[], description:'', duration:'', tags:[]}})
    }
  }

  return (
    <>
      <input type="checkbox" id={`toogle1${count1}`} className="hidden" onClick={handleCheckbox1}/>
      <input type="checkbox" id={`toogle2${count2}`} className="hidden" onClick={handleCheckbox2}/>
      <div className="px-2 pt-1">
          <div className={`bg-blue-500 text-white rounded bg-white p-2`}>
            <div>
                <div className="mb-2 text-sm font-medium">{name}</div>
            </div>
            <div className="flow-root">
              <div className="float-right text-sm">
                <label 
                  className={`${checked1 ? "bg-gray-800 text-white transition duration-200 hover:bg-gray-400 hover:text-black" : "bg-white text-black transition duration-200 hover:bg-gray-400"} mx-1 text-sm px-2 font-semibold rounded cursor-pointer`} 
                  onClick={()=>{handleTest1(id, name, steps, description, duration, tags)}} htmlFor={`toogle1${count1}`}>
                  1
                </label>
                <label 
                  className={`${checked2 ? "bg-gray-800 text-white transition duration-200 hover:bg-gray-400 hover:text-black" : "bg-white text-black transition duration-200 hover:bg-gray-400"} mx-1 text-sm px-2 font-semibold rounded cursor-pointer`} 
                  onClick={()=>{handleTest2(id, name, steps, description, duration, tags)}} htmlFor={`toogle2${count2}`}>
                  2
                </label>
              </div>
              <span className="float-left text-sm">
                <Badge
                  label={status}
                  color={status === "pass" ? "green" : "red"}
                  />
              </span>
            </div>
          </div>
      </div>
    </>
  )
}

function Scenario1({scenario1}) {
  const {id, name, nodes:steps, status, description, duration, categoryNameList:tags} = scenario1
  return (
    <>
      <ScenarioItem id={id} name={name} steps={steps} status={status} description={description} duration={duration} tags={tags}/>
    </>
  )
}

function Scenario2({scenario2}) {
  const {id, name, nodes:steps, status, description, duration, categoryNameList:tags} = scenario2
  return (
    <>
      <ScenarioItem id={id} name={name} steps={steps} status={status} description={description} duration={duration} tags={tags}/>
    </>
  )
}

function Tests({ featureid:id }){
  const { tests } = useTests({ "deep-populate": true, id });
  const [f] = tests?.content ?? [];
  const child = f ? f.nodes : [];
  return(
    <>
      {tests ? (
        <nav>
          <ul>
            {child?.map(scenarios1 => {
              const { nodes: scenario, bddType } = scenarios1;
              if (bddType === "Scenario Outline") {
                return (
                  scenario?.map(scenarios2 => {
                    return (
                      <li key={scenarios2?.id}>
                        <Scenario2 scenario2={scenarios2}/>
                      </li>
                    )
                  })
                  )
                } else {
                  return (
                  <li key={scenarios1?.id}>
                    <Scenario1 scenario1={scenarios1}/>
                  </li>
                )
              }
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex justify-center align-center my-2">
          <div className="w-8 opacity-50">
            <Spinner />
          </div>
        </div>
      )}
    </>
  )
}

function FeatureItem({features}) {
  const [actived, setActived] = useState(false)
  const { id, name, status } = features ?? {};
  return (
    <>
      <li className={`rounded border-2 border-blue-500 mt-2 mx-1 px-2 py-1 cursor-pointer transition duration-200 hover:bg-gray-100`} onClick={()=>{setActived(!actived)}}>
        <div>
            <div className="text-sm font-medium">{name}</div>
        </div>
        <div className="flow-root">
          {!!status && (
            <span className="inline-block text-sm">
              <Badge label={status} color={status === "pass" ? "green" : "red"} />
            </span>
          )}
          <span className="w-5 p-1 inline-block float-right">
            <img className="w-full cursor-pointer opacity-50" src={actived ? "/assets/arrow-down.png" : "/assets/arrow-right.png" }  alt={actived ? "arrow-down" : "arrow-right"}/>
          </span>
        </div>
      </li>
      <div className={ actived ? "" : "hidden"}>
        <Tests featureid={id} />
      </div>
    </>
  )
}

function RunItem({ rid, name, status, startTime, isActive }) {
  const [actived, setActived] = useState(false)
  const { features } = useFeatures(rid as string);
  const feature = features?.content
  return (
    <>
        <li className={`${actived ? "border-l-2 border-indigo-600" : "border-b"} p-2 cursor-pointer transition duration-200 hover:bg-gray-100`} onClick={()=>{setActived(!actived)}}>
          <div className="w-full">
            <div className="text-sm font-medium">
              {name}
            </div>
          </div>
          <div className="w-full">
            <p className="text-sm inline-block">
              {format(new Date(startTime), "dd/MM/yyyy HH:ss")}  
            </p>
            <span className="text-sm ml-3">
              <Badge
                label={status}
                color={status === "pass" ? "green" : "red"}
              />
            </span>
            <span className="w-5 p-1 mt-1 float-right">
              <img className="w-full cursor-pointer opacity-50" src={actived ? "/assets/arrow-down.png" : "/assets/arrow-right.png" }  alt={actived ? "arrow-down" : "arrow-right"}/>
            </span>
          </div>
        </li>
        <nav className={`${!actived && "hidden"}`}>
          <ul>
            {feature?.map(f => <FeatureItem key={f?.id} features={f}/>)}
          </ul>
        </nav>
    </>
  );
}

function NavMenu({runs}) {
  return (
    <div className="w-100 md:w-64 lg:w-64 xl:w-64 overflow-y-auto flex-shrink-0 overflow-x-hidden border">
      <nav>
          <ul>
            {runs?.map((runs) => {
            const {id, name, status, startTime} = runs
              return (
                <RunItem
                  key={id}
                  rid={id}
                  name={name}
                  status={status}
                  startTime={startTime}
                  isActive={true}
                />
              );
            })}
          </ul>
      </nav>
    </div>
  );
}

function LayoutCompare() {
  const { query, push, asPath } = useRouter();
  const { project } = useProject(query.id as string);
  const { runs } = useRuns({
    projectId: query.id as string,
  });
  const rs = runs?.content
  const goToProject = () => push(`/projects/${project?.id}`);
  return (
        <>
            <LayoutHeader>
              <div className="flex space-x-4">
                <nav className="container">
                  <ol className="flex text-grey">
                    {project?.name !== undefined &&
                    <li className="px-2"><a onClick={goToProject} className="cursor-pointer font-semibold">{`${project?.name}`}</a></li>}
                  </ol>
                </nav>
              </div>
            </LayoutHeader>
            <div className="md:flex lg:flex xl:flex h-screen bg-white overflow-hidden">
              <NavMenu runs={rs} />
              <Content />
            </div>
        </>
    )
}

function Compare() {
  return (
    <TestProvider>
      <Layout>
        <LayoutCompare />
      </Layout>
    </TestProvider>
  );
}

export default ProtectRoute(Compare);
