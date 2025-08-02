import { memo } from "react";

interface MarkersProps {
    fill: string;
    suffix: string;
}

const ZeroMarkers = ({ fill, suffix }: MarkersProps) => {
    return (
        <>
            <marker
                id={"edge-zero-marker-start" + suffix}
                viewBox="0 0 108 215"
                markerHeight={11}
                markerWidth={11}
                refX={-20}
                refY={107}
                orient="auto"
            >
                <circle
                    cx="60.5"
                    cy="107.5"
                    r="33.5"
                    style={{
                        fill: "#fff",
                        stroke: fill,
                        strokeWidth: 28,
                        strokeMiterlimit: 10,
                    }}
                />
            </marker>
            <marker
                id={"edge-zero-marker-end" + suffix}
                viewBox="0 0 108 215"
                markerHeight={11}
                markerWidth={11}
                refX={125}
                refY={110}
                orient="auto"
            >
                <circle
                    cx="48.5"
                    cy="107.5"
                    r="33.5"
                    style={{
                        fill: "#fff",
                        stroke: fill,
                        strokeWidth: 28,
                        strokeMiterlimit: 10,
                    }}
                />
            </marker>
        </>
    );
};

const OneMarkers = ({ fill, suffix }: MarkersProps) => {
    return (
        <>
            <marker
                id={"edge-one-marker-start" + suffix}
                viewBox="0 0 108 215"
                markerHeight={11}
                markerWidth={11}
                refX={0}
                refY={110}
                orient="auto"
                fill={fill}
            >
                <path d="M63 0h29v215H63z" />
            </marker>
            <marker
                id={"edge-one-marker-end" + suffix}
                viewBox="0 0 108 215"
                markerHeight={11}
                markerWidth={11}
                refX={100}
                refY={110}
                orient="auto"
                fill={fill}
            >
                <path d="M16 0h29v215H16z" />
            </marker>
        </>
    );
};

const ManyMarkers = ({ fill, suffix }: MarkersProps) => {
    return (
        <>
            <marker
                id={"edge-many-marker-start" + suffix}
                viewBox="0 0 108 215"
                markerHeight={9}
                markerWidth={9}
                refX={10}
                refY={108}
                orient="auto"
                fill={fill}
            >
                <path d="M0 92.5h159v29H0z" />
                <path d="M121.4 116.8-.6 34.5-.1-.2l31.6 21.4 106.1 71.6z" />
                <path d="m121.4 95.2-122 82.3.5 34.7 31.6-21.4 106.1-71.6z" />
            </marker>
            <marker
                id={"edge-many-marker-end" + suffix}
                viewBox="0 0 108 215"
                markerHeight={9}
                markerWidth={9}
                refX={150}
                refY={108}
                orient="auto"
                fill={fill}
            >
                <path d="M0 94.5h160v29H0z" />
                <path d="m38.6 118.8 122-82.3-.5-34.7-31.6 21.4L22.4 94.8z" />
                <path d="m38.6 97.2 122 82.3-.5 34.7-31.6-21.4-106.1-71.6z" />
            </marker>
        </>
    );
};

const Markers = () => {
    return (
        <svg style={{ position: "absolute", top: 0, left: 0, zIndex: -1 }}>
            <defs>
                <ZeroMarkers fill="#000" suffix="" />
                <ZeroMarkers fill="#51a2ff" suffix="-hover" />
                <ZeroMarkers fill="#155dfc" suffix="-selected" />

                <OneMarkers fill="#000" suffix="" />
                <OneMarkers fill="#51a2ff" suffix="-hover" />
                <OneMarkers fill="#155dfc" suffix="-selected" />

                <ManyMarkers fill="#000" suffix="" />
                <ManyMarkers fill="#51a2ff" suffix="-hover" />
                <ManyMarkers fill="#155dfc" suffix="-selected" />
            </defs>
        </svg>
    );
};

export default memo(Markers);
