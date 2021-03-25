import React, { useEffect, useState } from "react";
import {
  Layout,
  Badge,
  Spinner,
  MediaModal,
  Modal,
} from "src/components";
import classNames from "classnames";
import {
  useFeatures,
  useTests,
  useRun,
  useProject,
} from "src/utils/hooks";
import { ProtectRoute } from "src/context";
import {
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon,
  CrossCircleIcon,
  ExclamationSolidIcon,
} from "src/components";
import { customFormatDuration } from "src/utils";
import { Feature, Run as ApiRun, Test, updateTest } from "src/api";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";

interface FeatureItemProps {
  name: string;
  status: string;
  isActive?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

// @ts-ignore
const FeatureContext = React.createContext();

function FeatureProvider(props) {
  const [feature, setFeature] = React.useState<Feature>(null);
  const value = { feature, setFeature };
  return <FeatureContext.Provider value={value} {...props} />;
}

function useFeature() {
  const context = React.useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeature must be used within a FeatureProvider");
  }
  return context;
}

// @ts-ignore
const TestContext = React.createContext();

function TestProvider(props) {
  const [test, setTest] = React.useState<Test>(null);
  const value = { test, setTest };
  return <TestContext.Provider value={value} {...props} />;
}

function useTest() {
  const contextTest = React.useContext(TestContext);
  if (!contextTest) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return contextTest;
}

// @ts-ignore
const ModalContext = React.createContext();

function ModalProvider(props) {
  const [modal, setModal] = React.useState({
    modalOpen: false, 
    run:'', 
    project:'',
    testName:'',
    description:'',
  });
  const value = { modal, setModal };
  return <ModalContext.Provider value={value} {...props} />;
}

function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// @ts-ignore
const ScrollContext = React.createContext();

function ScrollProvider(props) {
  const [scroll, setScroll] = React.useState(false);
  const value = { scroll, setScroll };
  return <ScrollContext.Provider value={value} {...props} />;
}

function useScroll() {
  const contextScroll = React.useContext(ScrollContext);
  if (!contextScroll) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return contextScroll;
}

// agregando features al context
function SetFeatues({ features }) {
  // @ts-ignore
  const { setFeature } = useFeature();
  useEffect(() => {
    setFeature(features);
  }, [features]);

  return <>{/* <h1>{feature.name}</h1> */}</>;
}

function StateItem({ name, isActive, onClick }) {
  return (
    <li
      className={classNames(
        "flex",
        "justify-between",
        "py-3",
        "px-4",
        "items-center",
        "hover:bg-gray-200",
        "cursor-pointer",
        { "border-l-2 border-indigo-600 bg-gray-200": isActive }
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="font-medium text-sm">{name}</div>
      </div>
    </li>
  );
}

function NavMenu({ errorState }) {
  // @ts-ignore
  const { setTest } = useTest();

  // @ts-ignore
  const { test } = useTest();
  const handleSelect = (error) => (event) => {
    event.stopPropagation();

    // agregando tests o datos de los tests al context
    setTest(error);
  };
  return (
    <nav>
      <div className="p-4">
        <span>States</span>
        <p className="float-right text-white text-sm bg-blue-500 px-2 font-semibold rounded">
          {errorState.length}
        </p>
      </div>
      <ul>
        {errorState.map((error) => {
          return (
            <StateItem
              key={error}
              name={error}
              isActive={error === test}
              onClick={handleSelect(error)}
            />
          );
        })}
      </ul>
    </nav>
  );
}

function TestEmptyPlaceholder() {
  return (
    <div className="h-full flex-center flex-col font-medium text-gray-500 bg-gray-100">
      <div className="w-16 h-16 mb-4">
        <BeakerIcon />
      </div>
      <p className="text-center">Sin test por mostrar</p>
    </div>
  );
}

function StepWrapper({ children }) {
  return <ul className="space-y-2 py-4">{children}</ul>;
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

function Logs({ logs }) {
  return logs?.map(({ test, status, details, media }) => (
    <React.Fragment>
      {details != "" ? (
        <li
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

function StepsCard({ steps = [], bddType }) {
  return bddType === "Scenario" ? (
    <div className="mt-4 border border-gray-300 rounded-md p-4">
      <StepWrapper>
        {steps?.map(({ id, status, name, logs }) => (
          <Step key={id} {...{ id, status, name, logs }} />
        ))}
      </StepWrapper>
    </div>
  ) : (
    <></>
  );
}

function TestCard({ id, name, errorStates, duration, steps, runName, featureId, description, fetureName, errorTest, bddType }) {
  const formattedDuration = customFormatDuration({ start: 0, end: duration });
  const [checked, setChecked] = useState(false);
  const count = Math.random();
  const handleCheckbox = (e) => {
    setChecked(e.target.checked);
  };
  const { mutateTests } = useTests({ "deep-populate": true, id: featureId });

  // @ts-ignore
  const { modal, setModal } = useModal();
  const { modalOpen, testName } = modal
  
  const handleDeleteState = async (id, errorTest) => {
    await updateTest({ id, errorStates: [errorTest] });
    await mutateTests();
  };
  const handleModal = (name, runName) => {
    setModal({
      ...modal,
      modalOpen: true,
      testName: name,
      run: runName,
    })
  }
  return (
    <>
      <input
        type="checkbox"
        id={`toggle${count}`}
        className="hidden"
        onChange={handleCheckbox}
        />
      <div className="m-3 p-1 rounded border">
        <div>
          <span>{name}</span>
          {/* <span className="float-right text-white text-sm bg-blue-500 px-2 inline-flex leading-5 font-semibold rounded">Feture: {fetureName}</span> */}
          <div className="h-6 flex float-right">
           <label className="w-6 p-1 flex-center cursor-pointer rounded opacity-75 bg-gray-300 transition duration-300 hover:bg-gray-400 mr-3" htmlFor={`toggle${count}`}>
             <img className="w-full cursor-pointer" src={checked ? "/assets/invisible.png" : "/assets/visible.png" }  alt={checked ? "invisible" : "visible"}/>
           </label>
           <button className="px-2 flex-center cursor-pointer rounded bg-blue-500 transition duration-300 hover:bg-blue-600 focus:outline-none mr-3 focus:outline-none" onClick={(e) => {handleModal(name, runName)}}>
             <img className="w-4 mr-1" src="/assets/share-option.png" alt="share-option"/>
             <p className="text-xs text-white font-extrabold">Jira</p>
           </button>
           <button className="w-6 p-1 mr-3 flex-center cursor-pointer rounded bg-red-600 transition duration-300 hover:bg-red-700 focus:outline-none" onClick={(e) => {handleDeleteState(id, errorTest)}}>
             <img className="w-full" src="/assets/trash.png" alt="trash"/>
           </button>
          </div>
        </div>
        <div>
          {/* <div className=" inline-flex leading-5 rounded text-gray-900 tracking-wide items-center"> */}
            <span className="h-3"></span>
            run: {runName}
            {/* tiene que ser del mismo size que el siguiente ose que el detalle de el clock*/}
          {/* </div> */}
          <div className="inline-flex leading-5 rounded tracking-wide items-center m-2">
            <div className="flex items-center">
              <div className="w-4 h-4 text-gray-500 mr-2">
                <ClockIcon />
              </div>
              {formattedDuration ? (
                <span
                  className="block text-gray-500 text-sm"
                  title="Duration"
                >
                  {formattedDuration}
                </span>
              ) : null}
            </div>
          </div>
          {errorStates.map((error) => (
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
        {checked && (
          <div className="m-2">
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        )}
          <Transition
            show={checked}
            enter="transition ease-out duration-200 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <StepsCard steps={steps} bddType={bddType}/>
          </Transition>
      </div>
    </>
  );
}

function ScenarioOutline({ scenario1, fetureName, featureId }) {
  const scenarioOutline = scenario1?.bddType;

  if (scenarioOutline === "Scenario Outline") {
    const {
      id,
      name,
      errorStates,
      bddType,
      duration,
      endTime,
      description,
      nodes: steps,
      reportName: runName,
    } = scenario1;
    
    // @ts-ignore
    const { test: errorTest } = useTest();
    
    // @ts-ignore
    // const { setScroll } = useScroll();
    // setScroll(true);

    return (
      <>
        {errorStates?.includes(errorTest) && 
        <TestCard
            key={id}
            {...{
              id,
              name,
              errorStates,
              bddType,
              duration,
              endTime,
              steps,
              fetureName,
              featureId,
              runName,
              description,
              errorTest,
            }}
          />
        }
      </>
    )
  } else {
    return <></>;
  }
}

function ScenarioContent({ scenario2, fetureName, featureId }) {
  return (
    <>
      {scenario2?.map((tests) => {
        const {
          id,
          name,
          bddType,
          description,
          errorStates,
          duration,
          endTime,
          nodes: steps,
          reportName:runName,
        } = tests;

        // @ts-ignore
        const { test: errorTest } = useTest();
        if (errorStates?.includes(errorTest)) {
          // @ts-ignore
          const { setScroll } = useScroll();
          setScroll(true)
          return (
            <TestCard
              key={id}
              {...{
                id,
                name,
                bddType,
                errorStates,
                duration,
                endTime,
                steps,
                description,
                fetureName,
                featureId,
                runName,
                errorTest
              }}
            />
          );
        }
        // else {
        //   return <TestEmptyPlaceholder />;
        // }
      })}
    </>
  );
}

function Scenarios({ features }) {
  const { id } = features ?? {};
  const { tests, isLoading } = useTests({ "deep-populate": true, id });
  const [f] = tests?.content ?? [];
  // const type = f ? f.bddType : [];
  const child = f ? f.nodes : [];
  const name = f ? f.name : {};
  const fId = f ? f.id : {};

  if (isLoading) {
    return (
      <div className="w-full h-full flex-center">
        <Spinner className="h-10 w-10 text-gray-500" />
      </div>
    );
  } else {
    if (child) {
      return child?.map((scenario1) => {
        const { nodes: scenario2 } = scenario1;
        return (
          <>
            <ScenarioContent
              key={scenario2.id}
              scenario2={scenario2}
              fetureName={name}
              featureId={fId}
            />
            <ScenarioOutline
              key={scenario1.id}
              scenario1={scenario1}
              fetureName={name}
              featureId={fId}
            />
          </>
        );
      });
    }
  }
}

function Features({ feature }) {
  // @ts-ignore
  const { scroll } = useScroll();  
  return (
    <div className={`h-full ${scroll && 'overflow-y-auto'}`}>
      {feature?.map((features) => {
        return <Scenarios key={features.id} features={features} />;
      })}
    </div>
  );
}

function Content() {
  const { query } = useRouter();
  const { features } = useFeatures(query.rid as string);
  // @ts-ignore
  const { feature } = useFeature();
  return (
    <>
      <Features feature={feature} />
      {features && <SetFeatues features={features.content} /> }
    </>
  );
}

const LayoutState = () => {
  const { query } = useRouter();
  const { run } = useRun(query.rid as string);
  const { project } = useProject(run?.project);
  const { errorState, name } = project ?? {};

  // @ts-ignore
  const { modal, setModal } = useModal();
  // const { project:projectName } = modal

  useEffect(() => {
    setModal({...modal, project:name})  
  }, [name])
  
  return (
    <div className="md:flex lg:flex xl:flex h-screen bg-white overflow-hidden">
        <div className="w-100 md:w-64 lg:w-64 xl:w-64 overflow-y-auto flex-shrink-0 overflow-x-hidden border">
          {errorState && <NavMenu errorState={errorState} />}
        </div>
        <div className="w-full h-full">
          <Content />
        </div>
    </div>
  );
};

function FormModal() {
  // @ts-ignore
  const { modal, setModal } = useModal();
  const handleCloseModal = () => {
    setModal({...modal,modalOpen:false})
  }
  
  const { testName, run, project, description } = modal
  const handleChange = ({ target }) => {
    setModal({
      ...modal,
      [ target.name ]: target.value
    });
  }
  const handleSubmit = (e) => {
    // .trim()
    if (testName < 1 || run < 1 || project < 1 || description < 1) {
      alert('Completar los campos')
    } else {
      alert('Enviado');
      setModal({...modal,modalOpen:false})
    }
  }
  return (
    <>
      <Modal visible={modal?.modalOpen} onClose={() => {}}>
          <div className="bg-white w-5/12 m-auto rounded-lg shadow-2xl">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-11/12 mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-headline"
                  >
                    Form
                  </h3>
                  <div className="mt-3">
                    <input
                      className="text-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                      type="text"
                      name="project"
                      placeholder="Project"
                      value={project}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-3">
                    <input
                      className="text-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                      type="text"
                      placeholder="Run"
                      name="run"
                      value={run}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-3">
                    <input
                      className="text-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                      type="text"
                      placeholder="Test name"
                      name="testName"
                      value={testName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-3">
                    <textarea
                      className="h-20 text-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                      placeholder="Description"
                      name="description"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                // onClick={handleCloseModal}
                onClick={handleSubmit}
                type="submit"
                className="mr-6 bg-blue-500 text-white font-medium py-1 px-4 rounded transition duration-300 hover:bg-blue-600"
                >
                Send
              </button>
              <button
                onClick={handleCloseModal}
                type="button"
                className="mr-2 text-sm text-dark border font-medium py-0.5 px-2 rounded transition duration-300 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
      </Modal>
    </>
  )
}
function RunWithProvider() {
  return (
    <FeatureProvider>
      <TestProvider>
        <ScrollProvider>
          <ModalProvider>
            <Layout>
              <LayoutState />
              <FormModal />
            </Layout>
          </ModalProvider>
        </ScrollProvider>
      </TestProvider>
    </FeatureProvider>
  );
}

export default ProtectRoute(RunWithProvider);
