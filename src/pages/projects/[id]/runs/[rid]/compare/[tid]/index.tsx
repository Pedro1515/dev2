import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Badge, CheckCircleIcon, CrossCircleIcon, Layout, LayoutHeader, MediaModal, TagSolidIcon } from "src/components";
import { ProtectRoute } from "src/context";
import { customFormatDuration, useFeatures, useProject, useRuns, useTests } from "src/utils";
import format from "date-fns/format";
import classNames from "classnames";

// @ts-ignore
const TestContext = createContext();

function TestProvider(props) {
  const [test, setTest] = useState({
    test1:{id:null, name:'', count:[], description:'', errorStates:[], steps:[], duration:[], tags:[], runName:'', runStartTime:''},
    test2:{id:null, name:'', count:[], description:'', errorStates:[], steps:[], duration:[], tags:[], runName:'', runStartTime:''},
  })
  const value = { test, setTest };
  return <TestContext.Provider value={value} {...props} />;
}

function useTest() {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error("Test must be used within a testProvider");
  }
  return context;
}

function Dropdown({run, runs}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activedStyle, setActivedStyle] = useState(false)

  useEffect(() => {
    if (runs?.content.length >= 8) {
      setActivedStyle(true)
    }
  }, [runs])

  const handleFocus = (e) => {
    setIsOpen(true)
  }

  const handleBlur = (e) => {
    setIsOpen(false)
  }

  return (
    <>
      <li className="self-center max-w-50 relative">
        <button type="button" onFocus={handleFocus} onBlur={handleBlur} className="transition duration-200 hover:color-gray-900 focus:outline-none">
          {run?.name}
        </button>

        <Transition
          show={isOpen}
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div style={{height: activedStyle ? "80vh" : "auto"}} className={`absolute left-0 mt-2 w-56 origin-top-right`}>
            <nav style={{height: "70%"}} className="rounded-md border">
            <div style={{right: "-38px"}} className="inline-block bg-white absolute border py-1 px-2 shadow-sm rounded-md cursor-pointer transition duration-200 hover:bg-gray-100">
              <span className="leading-none text-xl font-extrabold" aria-hidden="true">&times;</span>
            </div>
              <ul className="h-full overflow-y-overlay rounded-md bg-white">
                {runs?.content.map(run => {
                  return (
                  <a  className="w-full" key={run?.id} href={`${run?.id}`}>
                    <li className={`p-2 text-sm transition duration-200 hover:bg-gray-200`}>{run?.name}</li>
                  </a>
                  )
                })}
              </ul>
            </nav>
          </div>
        </Transition>
      </li>
      <li className="self-center w-3 mx-2">
        <img className="w-full cursor-pointer" src={isOpen ? "/assets/arrow-down.png" : "/assets/arrow-right.png" }  alt={isOpen ? "arrow-down" : "arrow-right"}/>
      </li>
    </>
  )
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

function TestCard({name, steps, description, tags, formattedDuration, errorState, runName, runStartTime}) {
  return (
    <>
      {name && (
        <>
          <p className="text-md font-medium">{runName}</p>
          <div className="w-full">
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

function Test1({test}) {
  const {name, description, errorStates, duration, steps, tags, runName, runStartTime,} = test
  const formattedDuration = customFormatDuration({ start: 0, end: duration });

  return (
    <>
      <div className="float-left w-1/2 p-2">
        <TestCard name={name} description={description} steps={steps} tags={tags} errorState={errorStates} runName={runName} runStartTime={runName} formattedDuration={formattedDuration}/>
      </div>
    </>
  )
}

function Test2({test}) {
  const {name, description, errorStates, duration, steps, tags, runName, runStartTime,} = test
  const formattedDuration = customFormatDuration({ start: 0, end: duration });

  return (
    <>
      <div className="float-right w-1/2 p-2">
        <TestCard name={name} description={description} steps={steps} tags={tags} errorState={errorStates} runName={runName} runStartTime={runName} formattedDuration={formattedDuration}/>
      </div>
    </>
  )
}

function Content() {
  // @ts-ignore
  const { test } = useTest();
  const { test1, test2 } = test

  return (
    <div className="w-full h-full overflow-y-auto">
      <Transition
          show={!!test1?.id}
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
        <Test1 test={test1}/>
      </Transition>
      <Transition
        show={!!test2?.id}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Test2 test={test2}/>
      </Transition>
    </div>
  )
}

function ScenarioOutline({ count1, count2,  scenario, tid, runName, testActived, runStartTime }) {
  return (
    <>
      {scenario?.bddType === "Scenario Outline" && (
        scenario?.nodes.map((scenario) => {
            if (scenario?.name === tid) {
              return (
                <SetScenariotoContent count1={count1} count2={count2} key={scenario?.id} {...{scenario, runName, testActived, runStartTime}}/>
              )
            } else {
            return (
              <></>
            );}
          })
      )}
    </>
  )
}

function Scenario({ count1, count2, scenario, tid, runName, testActived, runStartTime }) {
  if (scenario?.bddType === "Scenario") {
    if (scenario?.name === tid) {
      return (
          <SetScenariotoContent {...{count1, count2, scenario, runName, testActived, runStartTime}}/>
          )
    } else {
    return (
      <></>
    );}
  } else {
    return (
      <></>
    );
  }
}

function ScenariosContent({ count1, count2, id, tid, runName, testActived, startTime:runStartTime}) {
  const { tests, isLoading } = useTests({ "deep-populate": true, id });
  return (
    <>
      {tests?.content.map(features => {
        const child = features ? features.nodes : [];
        return (
          <>
            {child?.map((scenario) => {
              return (
                <>
                  <ScenarioOutline count1={count1} count2={count2} key={`${scenario?.id} outline`} {...{ scenario, runStartTime, tid, testActived, runName }} />
                  <Scenario count1={count1} count2={count2} key={`${scenario?.id}`} {...{ scenario, runStartTime, tid, testActived, runName }} />
                </>
              )
            })}
          </>
        )
      })}
    </>
  )
}

function Features({ count1, count2, rid, tid, runName, testActived, startTime}) {
  const { features } = useFeatures(rid as string)
  return (
    <>
      {features?.content.map(f => {
        const id = f ? f.id : '';
        return (
          <>
            <ScenariosContent  count1={count1} count2={count2} key={id} id={id} tid={tid} runName={runName} startTime={startTime} testActived={testActived}/>
          </>
        )
      })}
    </>
  )
}

function SetScenariotoContent({ count1, count2, scenario, testActived, runName, runStartTime}) {
  const {
    id,
    name,
    description,
    nodes:steps,
    categoryNameList:tags,
    errorStates,
    duration,
  } = scenario;
  // @ts-ignore
  const { test, setTest } = useTest()
  useEffect(() => {
    if (testActived === "test-1-Actived") {
      setTest({...test, test1:{count:count1, id, name, description, errorStates, duration, steps, tags, runName, runStartTime,}})
    } else if (testActived === "test-2-Actived") {
      setTest({...test, test2:{count:count2, id, name, description, errorStates, duration, steps, tags, runName, runStartTime,}})
    }
  }, [testActived])
  return (
    <></>
  )
}

function RunItem({ i1, i2, rid, tid, name, status, startTime }) {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(false)

  // @ts-ignore
  const { test, setTest } = useTest()

  const handleCheckbox1 = (e) => {
    setChecked1(e.target.checked);
  };

  const handleCheckbox2 = (e) => {
    setChecked2(e.target.checked);
  };

  useEffect(() => {
    if (!checked1) {
      setTest({...test, test1:{id:null, name:'', description:'', errorStates:[], steps:[], duration:'', tags:[], runName:'', runStartTime:''}})
    }
  }, [checked1])

  useEffect(() => {
    if (!checked2) {
      setTest({...test, test2:{id:null, name:'', description:'', errorStates:[], steps:[], duration:'', tags:[], runName:'', runStartTime:''}})
    }
  }, [checked2])

  return (
    <>
      <input type="checkbox" id={i1} className="hidden" onClick={handleCheckbox1}/>
      <input type="checkbox" id={i2} className="hidden" onClick={handleCheckbox2}/>
      <li className={`p-2`}>
        <p className="text-sm font-medium cursor-default">
          {name}
        </p>
        <p className="text-xs cursor-default">
            {format(new Date(startTime), "dd/MM/yyyy HH:ss")}  
        </p>
        <div className="flow-root">
          <div className="float-left">
            <label
              className={`${checked1 
                ? "bg-gray-700 border border-gray-700 text-white hover:border-gray-800 transition duration-200 hover:bg-gray-800" 
                : "bg-gray-white border text-black hover:border-gray-800 transition duration-200 hover:bg-gray-800 hover:text-white"} 
                text-sm px-2 pt-px pb-px font-semibold rounded cursor-pointer select-none`} 
              htmlFor={i1}>
              1
            </label>
            <label
              className={`${checked2 
                ? "bg-gray-700 border border-gray-700 text-white hover:border-gray-800 transition duration-200 hover:bg-gray-800" 
                : "bg-gray-white border text-black hover:border-gray-800 transition duration-200 hover:bg-gray-800 hover:text-white"} 
                ml-2 text-sm px-2 pt-px pb-px font-semibold rounded cursor-pointer select-none`} 
              htmlFor={i2}>
              2
            </label>
          </div>
          <span className="float-right cursor-default">
            <Badge
              label={status}
              color={status === "pass" ? "green" : "red"}
            />
          </span>
        </div>
      </li>
      <Features count1={i1} count2={i2} rid={rid} tid={tid} runName={name} startTime={startTime} testActived={checked1 ? 'test-1-Actived' : null}/>
      <Features count1={i1} count2={i2} rid={rid} tid={tid} runName={name} startTime={startTime} testActived={checked2 ? 'test-2-Actived' : null}/>
    </>
  );
}

function NavMenu({runs, tid }) {
  return (
    <div className="w-100 xl:w-64 overflow-y-auto flex-shrink-0 overflow-x-hidden border-r border-gray-300">
      <div className="p-2">
        <span>{tid}</span>
        <div className="float-right">
          <button className="cursor-default text-white text-sm bg-blue-500 px-2 font-semibold rounded focus:outline-none">{runs?.length}</button>
        </div>
      </div>
      <nav>
          <ul>
            {runs?.map((runs) => {
            const {id, name, status, startTime} = runs
            const count1 = Math.random()
            const count2 = Math.random()
              return (
                <>
                  <RunItem
                    i1={count1}
                    i2={count2}
                    key={id}
                    rid={id}
                    tid={tid}
                    name={name}
                    status={status}
                    startTime={startTime}
                  />
                  {/* <Features rid={id} tid={tid} /> */}
                </>
              );
            })}
          </ul>
      </nav>
    </div>
  );
}

function LayoutCompare() {
    const { query } = useRouter()
    const { id, tid } = query
    const { project } = useProject(id as string)
    const { runs } = useRuns({
      projectId: id as string,
    });
    return (
        <>
            <LayoutHeader>
                <div className="w-1/2 mr-4 flex space-x-4">
                  {project?.name !== undefined &&
                  (<nav className="w-full">
                    <ol className="flex w-full text-grey">
                      <li className="self-center max-w-50">
                        <button className="w-full font-semibold cursor-default focus:outline-none"><a  href={`../`}>{`${project?.name}`}</a></button>
                      </li>
                      {/* <li className="self-center w-3 mx-2">
                        <img className="w-full" src={"/assets/arrow-right.png" }  alt={"arrow-right"}/>
                      </li> */}
                        {/* <Dropdown run={run} runs={runs} /> */}
                    </ol>
                  </nav>)
                  }
                </div>
            </LayoutHeader>
            <div className="md:flex lg:flex xl:flex h-screen bg-white overflow-hidden">
              <NavMenu tid={tid} runs={runs?.content.map(r => r )} />
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
  
