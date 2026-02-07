import {
  DataGridPremium,
  Toolbar,
  ToolbarButton,
  AiAssistantPanelTrigger,
  GridAiAssistantPanel,
} from "@mui/x-data-grid-premium";
import { mockPromptResolver, useDemoData } from "@mui/x-data-grid-generator";
import Tooltip from "@mui/material/Tooltip";

const AssistantIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 013 3v1a3 3 0 003 3h1a3 3 0 010 6h-1a3 3 0 00-3 3v1a3 3 0 01-6 0v-1a3 3 0 00-3-3H5a3 3 0 010-6h1a3 3 0 003-3V5a3 3 0 013-3z" />
  </svg>
);

function CustomToolbar() {
  return (
    <Toolbar>
      <Tooltip title="AI Assistant">
        <AiAssistantPanelTrigger render={<ToolbarButton />}>
          <AssistantIcon />
        </AiAssistantPanelTrigger>
      </Tooltip>
    </Toolbar>
  );
}

export default function GridAiAssistantPanelTrigger() {
  const { data, loading } = useDemoData({
    dataSet: "Employee",
    rowLength: 10,
    maxColumns: 10,
  });

  return (
    <div className="h-40, w-[100%]">
      <DataGridPremium
        {...data}
        loading={loading}
        aiAssistant
        slots={{
          toolbar: CustomToolbar,
          aiAssistantPanel: GridAiAssistantPanel,
        }}
        onPrompt={mockPromptResolver}
        showToolbar
      />
    </div>
  );
}
