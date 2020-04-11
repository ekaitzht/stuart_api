const assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
const expect = require("chai").expect;
chai.use(chaiHttp);
const url = "http://localhost:8080";
process.env.MONGODB = "localhost";

let { app, Courier } = require("../"); // eslint-disable-line prefer-const
describe("Testing couriers apis", function() {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  beforeEach(async function() {
    Courier.remove(function(err, removed) {});
    await sleep(20);
  });

  it("should POST a courier with id and max_capacity", async () => {
    const res = await chai
      .request(app)
      .post("/couriers")
      .send({ id: "1234", max_capacity: 45 });

    expect(res.body.resource.id).to.be.equal("1234");
    expect(res.body.resource.max_capacity).to.be.equal(45);
    expect(res).to.have.status(201);
  });

  it("should not allow to POST two couriers with the same id", async () => {
    let courier = new Courier({ max_capacity: 45, id: "1234", packages: [] });
    await courier.save();

    const res = await chai
      .request(app)
      .post("/couriers")
      .send({ id: "1234", max_capacity: 45 });
    expect(res).to.have.status(409);
  });

  it("should modify the max_capacity of the courier", async () => {
    let courier = new Courier({ max_capacity: 45, id: "1234", packages: [] });
    await courier.save();

    const res = await chai
      .request(app)
      .put("/couriers/1234")
      .send({ id: "1234", max_capacity: 51 });
    expect(res).to.have.status(200);
  });

  it("should return 404 if the resource does not exist", async () => {
    const res = await chai
      .request(app)
      .put("/couriers/1235")
      .send({ id: "1235", max_capacity: 51 });

    expect(res).to.have.status(404);
  });

  it("should delete a courier", async () => {
    let courier = new Courier({ max_capacity: 45, id: "1234", packages: [] });
    await courier.save();

    const res = await chai.request(app).delete("/couriers/1234");
    expect(res.body.msg).to.be.equal("Resource deleted with 1234 deleted");
    expect(res).to.have.status(200);
  });

  it("should give 404 when tries to delete a courierd that does not exist", async () => {
    const res = await chai.request(app).delete("/couriers/1235");
    expect(res.body.msg).to.be.equal("Resource not found");
    expect(res).to.have.status(404);
  });

  it("should return couriers with more than specific capacity_required", async () => {
    let courier1 = new Courier({ max_capacity: 11, id: "1234", packages: [] });
    await courier1.save();
    let courier2 = new Courier({ max_capacity: 10, id: "1235", packages: [] });
    await courier2.save();
    const res = await chai
      .request(app)
      .get("/couriers/lookup")
      .send({ capacity_required: 11 });
    expect(res.body.couriers.length).to.be.equal(1);
    expect(res.body.numberOfCouriers).to.be.equal(1);
    expect(res).to.have.status(200);
  });

  it("should add a package of 10 units to a courier", async () => {
    let courier1 = new Courier({ max_capacity: 45, id: "128", packages: [] });
    await courier1.save();
    const res = await chai
      .request(app)
      .post("/couriers/128/package")
      .send({
        packageId: "x128",
        description: "headphones",
        weight: 10
      });

    expect(res.body.resource.max_capacity).to.be.equal(35);
    expect(res.body.resource.packages[0].description).to.be.equal("headphones");
    expect(res.body.resource.packages[0].packageId).to.be.equal("x128");
    expect(res.body.resource.packages[0].weight).to.be.equal(10);
  });

  it("should remove package from the courier", async () => {
    let courier = new Courier({
      max_capacity: 45,
      id: "128",
      packages: [
        {
          packageId: "x128",
          description: "headphones",
          weight: 10
        },
        {
          packageId: "x129",
          description: "mouse mx",
          weight: 10
        }
      ]
    });
    await courier.save();

    const res = await chai.request(app).delete("/couriers/128/package/x129");
    expect(res.body.courier.packages.length).to.be.equal(1);
    expect(res.body.courier.packages[0].packageId).to.be.equal("x128");
  });
});
