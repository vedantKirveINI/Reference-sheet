import * as go from "gojs";

const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
go.Shape.defineFigureGenerator("AndGate", function (shape, w, h) {
  var geo = new go.Geometry();
  var cpOffset = KAPPA * 0.5;
  var fig = new go.PathFigure(0, 0, true);
  geo.add(fig);

  // The gate body
  fig.add(new go.PathSegment(go.PathSegment.Line, 0.5 * w, 0));
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      w,
      0.5 * h,
      (0.5 + cpOffset) * w,
      0,
      w,
      (0.5 - cpOffset) * h
    )
  );
  fig.add(
    new go.PathSegment(
      go.PathSegment.Bezier,
      0.5 * w,
      h,
      w,
      (0.5 + cpOffset) * h,
      (0.5 + cpOffset) * w,
      h
    )
  );
  fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
  geo.spot1 = go.Spot.TopLeft;
  geo.spot2 = new go.Spot(0.55, 1);
  return geo;
});

go.Shape.defineFigureGenerator("CapsuleH", function (shape, w, h) {
  var geo = new go.Geometry();
  var fig;
  if (w < h) {
    fig = new go.PathFigure(w / 2, 0, true);
    fig.add(new go.PathSegment(go.PathSegment.Bezier, w / 2, h, w, 0, w, h));
    fig.add(new go.PathSegment(go.PathSegment.Bezier, w / 2, 0, 0, h, 0, 0));
    geo.add(fig);
    return geo;
  } else {
    fig = new go.PathFigure(h / 2, 0, true);
    geo.add(fig);
    // Outline
    fig.add(new go.PathSegment(go.PathSegment.Line, w - h / 2, 0));
    fig.add(
      new go.PathSegment(
        go.PathSegment.Arc,
        270,
        180,
        w - h / 2,
        h / 2,
        h / 2,
        h / 2
      )
    );
    fig.add(new go.PathSegment(go.PathSegment.Line, w - h / 2, h));
    fig.add(
      new go.PathSegment(
        go.PathSegment.Arc,
        90,
        180,
        h / 2,
        h / 2,
        h / 2,
        h / 2
      )
    );
    return geo;
  }
});

go.GraphObject.defineBuilder("ToolTip", function (args) {
  var ad = go.GraphObject.make(
    go.Adornment,
    "Auto",
    {
      isShadowed: false,
      zOrder: 100,
    },
    go.GraphObject.make(go.Shape, {
      name: "Border",
      figure: "RoundedRectangle",
      parameter1: 12,
      fill: "rgba(0,0,0,0.4)",
      stroke: "transparent",
    })
  );
  return ad;
});
