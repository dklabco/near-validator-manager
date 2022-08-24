import { utils } from "near-api-js";
import { styled } from "@mui/material/styles";
import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
// import { /*DataGrid,*/ type GridColDef } from "@mui/x-data-grid";
import React, { PropsWithChildren, type FC, type ReactNode } from "react";
import { IStackingPoolContractGetAccountsRespAccount } from "shared/types";

interface IPoolGetAccountsProps {
  accounts: IStackingPoolContractGetAccountsRespAccount[]
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const cellGetter = (row: { [key: string]: any }, colId: string): ReactNode => {
  switch (colId) {
    case "staked_balance":
    case "unstaked_balance": {
      const valueInYoctoNear = row[colId];
      const valueInNear = utils.format.formatNearAmount(valueInYoctoNear, 0);
      return <Tooltip title={valueInYoctoNear}>
        <span>{valueInNear}</span>
      </Tooltip>;
    }
    case "can_withdraw":
      return row[colId] === true ? "true" : "false";
    default:
      return row[colId];
  }
}

export const PoolGetAccounts: FC<IPoolGetAccountsProps> = (props) => {

  const rows = props.accounts;
  const columns: { field: string }[] = [
    { field: "account_id" },
    { field: "staked_balance" },
    { field: "unstaked_balance" },
    { field: "can_withdraw" },
  ];

  return <HtmlWrapper>
    <Paper square sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            {columns.map((col, id) => <StyledTableCell key={id}>{col.field}</StyledTableCell>)}
          </TableHead>
          <TableBody>
            {rows.map(row => <StyledTableRow key={row.account_id}>
              {columns.map((col, id) => <StyledTableCell key={id}>
                <span>{cellGetter(row, col.field)}</span>
              </StyledTableCell>)}
            </StyledTableRow>)}
          </TableBody>
        </Table>
        {/* <DataGrid
          rows={rows}
          columns={columns}
          getRowId={row => row.account_id}
          pageSize={5}
          rowsPerPageOptions={[5]}
        /> */}
      </TableContainer>
    </Paper>
  </HtmlWrapper>;
}

// @TODO factor this out
export const HtmlWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <html style={{ padding: 0, margin: 0, height: "100%" }}>
    <head>
      <title>NEAR Validator Manager</title>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
    </head>
    <body style={{ height: "100%", margin: 0, padding: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <section>
          {children}
        </section>
        <section style={{ flexGrow: 1 }}></section>
        <footer style={{ padding: "0 10px" }}>
          <Typography fontSize={12} style={{ float: "right" }}>
            {"Made with "}
            <Icon fontSize="small" style={{ verticalAlign: "top" }}>favorite</Icon>
            {" at "}
            <a href="https://github.com/dklabco">DKLAB</a>
          </Typography>
        </footer>
      </div>
    </body>
  </html>;
}