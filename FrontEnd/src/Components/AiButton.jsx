import { useState } from "react";
import styled from "styled-components";
import AiFeatures from "../Pages/User/AiFeature";
import Checkbox from "./SideMenu";

export default function FloatingActionMenu() {
  const [aiOpen, setAiOpen] = useState(false);
  const [button, setButton] = useState(false);

  const changeStatus = () => {
    setButton((prev) => !prev);
  };

  return (
    <>
      {button ? (
        <>
          {aiOpen && (
            <Overlay>
              <AiFeatures />
            </Overlay>
          )}

          <Wrapper>
            <div className="wrapper-inner">
              <Checkbox onClick={changeStatus} />
              <div className="action-wrap">
                {/* AI BUTTON */}
                <button
                  className="action"
                  type="button"
                  onClick={() => setAiOpen((v) => !v)}
                >
                  <svg
                    className="action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                  >
                    {aiOpen ? (
                      <>
                        <path d="M6 6l12 12" />
                        <path d="M18 6l-12 12" />
                      </>
                    ) : (
                      <>
                        <path d="M12 2v4" />
                        <path d="M12 18v4" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>

                  <span className="action-content">AI Assistant</span>
                </button>

                {/* ADD TASK BUTTON */}
                <button className="action" type="button">
                  <svg
                    className="action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>

                  <span className="action-content">Add Task</span>
                </button>

                <div className="backdrop" />
              </div>
            </div>
          </Wrapper>
        </>
      ) : (
        <SmallWrapper>
          <Checkbox onClick={changeStatus} />
        </SmallWrapper>
      )}
    </>
  );
}

const Wrapper = styled.div`
  position: fixed;
  right: 2.5rem;
  bottom: 1.75rem;
  z-index: 50;

  .wrapper-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .action-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 9999px;
    overflow: hidden;
  }

  .backdrop::before {
    content: "";
    position: absolute;
    width: 10.5rem;
    height: 10.5rem;
    border-radius: 9999px;
    background: linear-gradient(144deg, #af40ff, #4f46e5);
    animation: rotate 2s linear infinite;
  }

  .backdrop::after {
    content: "";
    position: absolute;
    inset: 0;
    backdrop-filter: blur(8px);
    border-radius: 9999px;
  }

  .action {
    position: relative;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 9999px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: transform 300ms ease;
  }

  .action:hover {
    transform: scale(1.1);
  }

  .action-icon {
    width: 100%;
    height: 100%;
    padding: 0.5rem;
    background: #f1f1f1;
    border-radius: 9999px;
    transition: transform 300ms ease;
  }

  .action:hover .action-icon {
    transform: scale(1.35) translateX(-12px);
    background: #aff6;
  }

  .action-content {
    position: absolute;
    right: calc(100% + 25px);
    top: 50%;
    padding: 6px 10px;
    background: #fff;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    border: 1px solid #ccc;
    opacity: 0;
    white-space: nowrap;
    transition: opacity 300ms ease, transform 300ms ease;
    transform: translateX(-10px);
  }

  .action:hover .action-content {
    opacity: 1;
    transform: translateX(0);
  }

  @keyframes rotate {
    to {
      transform: rotate(1turn);
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
`;

const SmallWrapper = styled.div`
  position: fixed;
  right: 2.5rem;
  bottom: 5rem;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;
