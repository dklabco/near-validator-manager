import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Input from "@mui/material/Input";
import { Alert, AlertTitle } from "@mui/material";
import "./App.scss";

import { updateNetworkId } from "./services";
import { IRespPayload, NEAR_NETWORK_ID } from "shared/types";

const App: React.FunctionComponent = () => {

  const [networkId, setNetworkId] = useState<string>("shardnet");
  const [poolId, setPoolId] = useState<string>("xx.factory.shardnet.near");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  function validateAllFields(): true | string[] {
      const validationIssues: string[] = [];
      if (networkId === "") validationIssues.push("missing networkId");
      if (poolId === "") validationIssues.push("missing poolId");
      // if (!isValidEmail(email)) validationIssues.push("invalid email address");
      return validationIssues.length ? validationIssues : true;
  }

  async function attemptSubmit(evt?: React.FormEvent<HTMLFormElement>): Promise<void> {

      if (isSubmitting) return;

      if (evt && evt.type === "submit") {
        // we handle form submission instead of letting the browser redirect
        // as per its default behavior
        evt.preventDefault();
      }

      // clear error and feedback views before making a new submission
      setErrors([]);
      setFeedback("");

      const validationResult: true | string[] = validateAllFields();
      if (validationResult === true) {

          setIsSubmitting(true);
          try {
              const resp: IRespPayload = await updateNetworkId(networkId as NEAR_NETWORK_ID);
              // @TODO handle poolId as well
              setFeedback(resp.message);
              
          } catch (e) {
              // display API call error
              setErrors([`An error occurred: ${(e as Error).message}`]);
          }
          setIsSubmitting(false);

      } else {
          // display validation error(s)
          setErrors(validationResult);
      }

  }

  return <Dialog
    open={true}
    className="the-dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
  <form action="#" autoComplete="off" onSubmit={attemptSubmit}>
    <DialogTitle id="dialog-title">{process.env.APP_NAME}</DialogTitle>
    <DialogContent>
      <h5><DialogContentText>
        <small>{"configuration"}</small>
      </DialogContentText></h5>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flexGrow: 1 }}>
            <Input
              disabled // @TODO enable once dynamic networkId is supported
              title="Only 'shardnet' is supported for now"
              name="networkId"
              type="text"
              inputMode="text"
              placeholder={"shardnet"}
              value={networkId}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setNetworkId(evt.target.value)}
              inputProps={{ "aria-label": "networkId" }}
              fullWidth
            />
          </div>
          <div style={{ minWidth: 10, flexGrow: 0 }} />
        </div>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <Input
            name="poolId"
            type="text"
            inputMode="text"
            placeholder={"xx.factory.shardnet.near"}
            value={poolId}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setPoolId(evt.target.value)}
            inputProps={{ "aria-label": "poolId" }}
            fullWidth
          />
        </div>
      {feedback !== "" && <Alert severity="info" className="feedback-info">
        <span>{feedback}</span>
        {" "}
        (<a href={`/validator/${poolId}/get_accounts/view`} target="_blank" style={{ textDecoration: "underline", color: "inherit" }}>
            {"view 'get_accounts' result for validator"}
        </a>)
      </Alert>}
      {errors.length > 0 && <Alert severity="error" className="feedback-error">
        <AlertTitle>{"You have entered invalid information"}</AlertTitle>
        <ul style={{ padding: "0 0 0 20px", margin: 0 }}>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
        </ul>
      </Alert>}
    </DialogContent>
    <DialogActions>
      <Button type="submit" color="primary" autoFocus disableRipple>
        {"Submit"}
      </Button>
    </DialogActions>
  </form>
  </Dialog>;

};

export default App;

// below are alternative (examplary) approaches to rendering (almost) the same
// layout using different ReactJS UI frameworks:

// 1. Blueprint
/*
return (
<Dialog
  isOpen={true}
  title={process.env.APP_NAME}
  isCloseButtonShown={false}
  style={{ minWidth: 600 }}
>
  <div className={Classes.DIALOG_BODY}>
    <H5>Demo simple web app <small>(all fields are required)</small></H5>
    <form action="#">
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 1 }}>
          <InputGroup
            name="firstName"
            type="text"
            inputMode="text"
            fill
            placeholder={"first name"}
            value={firstName}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setFirstName(evt.target.value)}
          />
        </div>
        <div style={{ minWidth: 10, flexGrow: 0 }} />
        <div style={{ flexGrow: 1 }}>
          <InputGroup
            name="lastName"
            type="text"
            inputMode="text"
            fill
            placeholder={"last name"}
            value={lastName}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setLastName(evt.target.value)}
          />
        </div>
      </div>
      <InputGroup
          style={{ marginTop: 10, marginBottom: 10 }}
          name="email"
          type="email"
          inputMode="email"
          placeholder={"email"}
          value={email}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setEmail(evt.target.value)}
      />
    </form>
    {feedback !== "" && <Callout style={{ marginTop: 10 }} className="co-feedback">
        <span>{feedback}</span>
        {" "}
        (<a href="/entries" target="_blank" style={{ textDecoration: "underline", color: "inherit" }}>
            view all entries as JSON
        </a>)
    </Callout>}
    {errors.length > 0 && <Callout intent={Intent.DANGER} icon={null} style={{ marginTop: 10 }} className="co-errors">
        <ul style={{ padding: "0 0 0 20px", margin: 0 }}>
            {errors.map((error, i) => <li key={i}>{error}</li>)}
        </ul>
    </Callout>}
  </div>
  <div className={Classes.DIALOG_FOOTER} style={{ display: "flex" }}>
      <span style={{ opacity: 0.5 }}>client env: {process.env.NODE_ENV}</span>
      <span style={{ flexGrow: 1 }} />
      <Button type="submit" text={"Submit"} intent={Intent.PRIMARY} onClick={attemptSubmit} autoFocus />
  </div>
</Dialog>
)
*/

// 2. Atlaskit
/*
const CustomFooter = (props: FooterComponentProps) => {
  return (
    <ModalFooter {...props}>
      <span />
      <Button appearance={props.appearance} onClick={attemptSubmit}>
        Submit
      </Button>
    </ModalFooter>
  );
};

return <div><ModalTransition>
  <Modal
    components={{
      Footer: CustomFooter,
      Container: ({ children }) => <div className="model-container">
        <div className="model-host">{children}</div>
      </div>
    }}
    heading={process.env.APP_NAME}
  >
    <h5>Demo simple web app <small>(all fields are required)</small></h5>
    <form action="#">
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flexGrow: 1 }}>
        <Textfield
          name="firstName"
          type="text"
          inputMode="text"
          placeholder={"first name"}
          value={firstName}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setFirstName(evt.target.value)}
          isCompact
        />
      </div>
      <div style={{ minWidth: 10, flexGrow: 0 }} />
      <div style={{ flexGrow: 1 }}>
        <Textfield
          name="lastName"
          type="text"
          inputMode="text"
          placeholder={"last name"}
          value={lastName}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setLastName(evt.target.value)}
          isCompact
        />
      </div>
    </div>
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <Textfield
        name="email"
        type="email"
        inputMode="email"
        placeholder={"email"}
        value={email}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setEmail(evt.target.value)}
        isCompact
      />
    </div>
    </form>
    {feedback !== "" && <SectionMessage>
      <span>{feedback}</span>
      {" "}
      (<a href="/entries" target="_blank" style={{ textDecoration: "underline", color: "inherit" }}>
          view all entries as JSON
      </a>)
    </SectionMessage>}
    {errors.length > 0 && <SectionMessage appearance="error" title={"You have entered invalid information"}>
      <ul style={{ padding: "0 0 0 20px", margin: 0 }}>
          {errors.map((error, i) => <li key={i}>{error}</li>)}
      </ul>
    </SectionMessage>}
  </Modal>
</ModalTransition></div>;
*/
