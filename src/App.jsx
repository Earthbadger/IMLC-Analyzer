import { useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { Chart as ChartJS } from "chart.js/auto";
import Grid from "@mui/material/Grid";
import Instructions from "./Instructions.jsx";
import LineGraph from "./LineGraph.jsx";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const datasetTemplate = {
  pointRadius: 2,
};

const initialData = {
  labels: [],
  datasets: [],
};

function App() {
  const [isParsingFiles, setIsParsingFiles] = useState(false);

  const [latencyData, setLatencyData] = useState(initialData);
  const [bandwidthData, setBandwidthData] = useState(initialData);

  function ClearAllData() {
    setLatencyData(initialData);
    setBandwidthData(initialData);
  }

  const resultsRef = useRef(null);

  const results = {};

  function parseFiles(files) {
    setIsParsingFiles(true);

    function parseFile(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const lines = e.target.result.split("\n");

          lines.forEach((line) => {
            if (/^\s*\d/.test(line)) {
              const [delay, latencyValue, bandwidthValue] = line
                .trim()
                .split(/\s+/)
                .map((value) => parseFloat(value));

              if (!(file.name in results)) {
                results[file.name] = {};
              }

              if (!(delay in results[file.name])) {
                results[file.name][delay] = {
                  latency: [latencyValue],
                  bandwidth: [bandwidthValue],
                };
              } else {
                results[file.name][delay]["latency"].push(latencyValue);
                results[file.name][delay]["bandwidth"].push(bandwidthValue);
              }
            }
          });
          resolve();
        };

        reader.readAsText(file);
      });
    }

    const promises = files.map((file) => parseFile(file));

    Promise.all(promises)
      .then(() => {
        const latencyDatasets = [...latencyData["datasets"]];
        const bandwidthDatasets = [...bandwidthData["datasets"]];

        for (const fileName in results) {
          const averageLatencies = [];
          const averageBandwidths = [];

          for (const delay in results[fileName]) {
            const averageLatency =
              results[fileName][delay]["latency"].reduce(
                (acc, num) => acc + num,
                0
              ) / results[fileName][delay]["latency"].length;

            const averageBandwidth =
              results[fileName][delay]["bandwidth"].reduce(
                (acc, num) => acc + num,
                0
              ) / results[fileName][delay]["bandwidth"].length;

            averageLatencies.push(averageLatency);
            averageBandwidths.push(averageBandwidth);
          }

          if (
            !latencyDatasets.some((dataset) => dataset["label"] === fileName)
          ) {
            latencyDatasets.push({
              ...datasetTemplate,
              label: fileName,
              data: averageLatencies,
            });
          }

          if (
            !bandwidthDatasets.some((dataset) => dataset["label"] === fileName)
          ) {
            bandwidthDatasets.push({
              ...datasetTemplate,
              label: fileName,
              data: averageBandwidths,
            });
          }
        }

        setLatencyData({
          labels: Object.keys(results[Object.keys(results)[0]]),
          datasets: latencyDatasets,
        });

        setBandwidthData({
          labels: Object.keys(results[Object.keys(results)[0]]),
          datasets: bandwidthDatasets,
        });
      })
      .catch((error) => {
        console.error(error);
      });

    setIsParsingFiles(false);
  }

  return (
    <Grid container>
      <Grid container justifyContent="center">
        <Typography variant="h4" mb={1}>
          Intel® Memory Latency Checker (IMLC) Analyzer
        </Typography>
      </Grid>
      <Grid xs={12}>
        <Box mb={2}>
          <Instructions
            isParsingFiles={isParsingFiles}
            parseFiles={parseFiles}
            resultsRef={resultsRef}
            clearAllData={ClearAllData}
            currentlyUploadedItems={latencyData["datasets"].length}
          />
        </Box>
      </Grid>
      <Grid xs={12} p={5} ref={resultsRef}>
        <Grid xs={12}>
          <LineGraph
            dataset={latencyData}
            yTitle="Latency (nanoseconds)"
            xTitle="Inject Delay"
          />
        </Grid>
        <Grid xs={12}>
          <LineGraph
            dataset={bandwidthData}
            yTitle="Bandwidth (MB/s)"
            xTitle="Inject Delay"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default App;
