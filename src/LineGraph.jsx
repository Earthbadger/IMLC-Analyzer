import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

function LineGraph({ dataset, yTitle, xTitle }) {
  return (
    <Line
      data={dataset}
      options={{
        scales: {
          x: {
            title: { display: true, text: xTitle },
          },
          y: {
            title: { display: true, text: yTitle },
          },
        },
      }}
    ></Line>
  );
}

LineGraph.propTypes = {
  dataset: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.array,
  }),
  yTitle: PropTypes.string.isRequired,
  xTitle: PropTypes.string.isRequired,
};

export default LineGraph;
