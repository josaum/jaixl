/* eslint-disable no-unused-vars */
/* global console setInterval, clearInterval */

function listObjToMultiDim(list, elementsToRetrieve, include_headers) {
  var matrix = [];

  console.log(list);
  console.log(list.length);
  let firstUnroll = true;
  var new_headers = [];
  for (let row = 0; row < list.length; row++) {
    var row_values = [];
    for (const col of elementsToRetrieve) {
      if (Array.isArray(list[row][col])) {
        row_values.push(list[row][col].toString());
      } else if (typeof list[row][col] === "object" && list[row][col] !== null) {
        console.log(list[row][col]);
        for (const [key, value] of Object.entries(list[row][col])) {
          if (firstUnroll) {
            new_headers.push(key);
          }
          row_values.push(value);
        }
      } else {
        row_values.push(list[row][col]);
      }
    }
    firstUnroll = false;
    matrix.push(row_values);
  }
  if (include_headers) {
    if (!firstUnroll) {
      console.log(new_headers);
      elementsToRetrieve = elementsToRetrieve.concat(new_headers);
      elementsToRetrieve = elementsToRetrieve.filter((item) => item !== "predict");
    }
    console.log(elementsToRetrieve);
    matrix.unshift(elementsToRetrieve);
  }
  console.log(matrix);
  return matrix;
}

function listToMatrix(list, elementsPerSubArray) {
  var matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
    console.log(matrix);
  }

  return matrix;
}

function arr2obj(arr) {
  // Create an empty object
  let obj = {};

  arr.forEach((v) => {
    // Extract the key and the value
    let key = v[0];
    let value = v[1];

    // Add the key and value to
    // the object
    obj[key] = value;
  });

  // Return the object
  return obj;
}

function tryParseInt(str, defaultValue) {
  return parseInt(str) == str ? parseInt(str) : defaultValue;
}

function tryParseFloat(str, defaultValue) {
  return parseFloat(str) == str ? parseFloat(str) : defaultValue;
}

/**
 * J Similar IDs - Search for similar data by ids
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to Search
 * @param {number[][]} id_input Ids to search
 * @param {number} [top_k] Number of similars to retrieve - default=5
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {number[][]} Similar Ids.
 */
async function similar(auth_key, collection, id_input, top_k, env) {
  if (top_k === null) {
    top_k = 5;
  }

  if (env === null) {
    env = "default";
  }

  console.log(id_input);
  let id_input_query = id_input.flat();

  // if (!Array.isArray(id_input)) {
  //   console.log(id_input);
  //   let ids_to_query = [ids_to_query];
  // } else {
  //   let ids_to_query = ids_to_query;
  // }

  console.log(id_input_query);
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  const myJSON = JSON.stringify(id_input_query);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: myJSON,
  };

  var id_similars = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/similar/id/" + collection + "?top_k=" + top_k, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      response["similarity"].forEach((query) => {
        query["results"].forEach((qres) => {
          console.log(qres["id"]);
          id_similars.push(qres["id"]);
        });
      });
    })
    .catch((error) => console.log("error", error));

  console.log(id_similars);
  var result = listToMatrix(id_similars, top_k);
  console.log(result);

  return result;
}

/**
 * J Similar Data - Search for similar data with new data as input
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to perform Search
 * @param {string[][]} input_data Model inputs
 * @param {number} [top_k] Number of similars to retrieve - default=
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {number[][]} Similar Ids.
 */
async function similardata(auth_key, collection, input_data, top_k, env) {
  if (top_k === null) {
    top_k = 5;
  }

  if (env === null) {
    env = "default";
  }

  console.log(input_data);
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseInt(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: myJSON,
  };

  var id_similars = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/similar/data/" + collection + "?top_k=" + top_k, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      response["similarity"].forEach((query) => {
        query["results"].forEach((qres) => {
          console.log(qres["id"]);
          id_similars.push(qres["id"]);
        });
      });
    })
    .catch((error) => console.log("error", error));

  console.log(id_similars);
  var result = listToMatrix(id_similars, top_k);
  console.log(result);

  return result;
}

/**
 * J Recommendation IDs - Recommendation by Ids
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Base Collection to Recommend (e.g. Products, in a Products to Users Recommendation)
 * @param {number[][]} id_input Ids to recommend to (e.g. User ID, in a Products to Users Recommendation)
 * @param {number} [top_k] Number of recommendations to retrieve - default=5
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {number[][]} Recommendations Ids.
 */
async function recommend(auth_key, collection, id_input, top_k, env) {
  if (top_k === null) {
    top_k = 5;
  }

  if (env === null) {
    env = "default";
  }

  console.log(id_input);
  let id_input_query = id_input.flat();

  // if (!Array.isArray(id_input)) {
  //   console.log(id_input);
  //   let ids_to_query = [ids_to_query];
  // } else {
  //   let ids_to_query = ids_to_query;
  // }

  console.log(id_input_query);
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  const myJSON = JSON.stringify(id_input_query);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: myJSON,
  };

  var id_similars = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/recommendation/id/" + collection + "?top_k=" + top_k, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      response["recommendation"].forEach((query) => {
        query["results"].forEach((qres) => {
          console.log(qres["id"]);
          id_similars.push(qres["id"]);
        });
      });
    })
    .catch((error) => console.log("error", error));

  console.log(id_similars);
  var result = listToMatrix(id_similars, top_k);
  console.log(result);

  return result;
}

/**
 * J Predict - Perform inference on collection with db_type Supervised
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to perform Inference
 * @param {string[][]} input_data Model inputs
 * @param {boolean} [predict_proba] Whether to return probabilities or just the most probable class (for classification models only). Default: False
 * @param {boolean} [include_headers] Whether to return column names or just the values. Default: False
 * @param {boolean} [include_response_id] Whether to return the response column id Default: False
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string[][]} Model Inference
 */
async function predict(auth_key, collection, input_data, predict_proba, include_headers, include_response_id, env) {
  if (predict_proba === null) {
    predict_proba = false;
  }

  if (include_headers === null) {
    include_headers = false;
  }

  if (include_response_id === null) {
    include_response_id = false;
  }

  if (env === null) {
    env = "default";
  }

  console.log(input_data);
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  // check if there is an id column
  let hasid = false;
  for (let i = 0; i < input_data[0].length; i++) {
    if (input_data[i] == "id") {
      hasid = true;
    }
  }

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseInt(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: myJSON,
  };

  // eslint-disable-next-line no-undef
  pred_response = await fetch(
    "https://mycelia.azure-api.net/predict/" + collection + "?predict_proba=" + predict_proba.toString(),
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .catch((error) => console.log("error", error));

  var results_columns = [];

  // eslint-disable-next-line no-undef
  for (const [key, value] of Object.entries(pred_response[0])) {
    if (include_response_id) {
      results_columns.push(key);
    } else {
      if (key != "id") {
        results_columns.push(key);
      }
    }
  }

  // eslint-disable-next-line no-undef
  var result = listObjToMultiDim(pred_response, results_columns, include_headers);
  return result;
}

/**
 * J Fields - Retrieve collection fields
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to query fields
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string[][]} Fields used on collection and their types
 */
async function fields(auth_key, collection, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  var fields = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/fields/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      const keys = Object.keys(response);
      keys.forEach((key, index) => {
        fields.push([key, response[key]]);
      });
    })
    .catch((error) => console.log("error", error));

  console.log(fields);
  let fields_t = fields[0].map((_, colIndex) => fields.map((row) => row[colIndex]));
  // var result = listToMatrix(preds, 1);
  return fields_t;
}

/**
 * J Ids - Retrieve collection IDs
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to query ids
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {number[][]} Complete list of Ids present in the collection
 */
async function ids(auth_key, collection, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  var ids = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/id/" + collection + "?mode=complete", requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ids.push(response);
    })
    .catch((error) => console.log("error", error));
  let ids_t = ids[0].map((_, colIndex) => ids.map((row) => row[colIndex]));
  return ids_t;
}

/**
 * J Info
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string[][]} Returns the complete list of collections on the subscription
 */
async function info(auth_key, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  var info = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/info?mode=complete&get_size=true", requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      info.push(response);
    })
    .catch((error) => console.log("error", error));
  let result_ex = info[0][0];
  console.log(result_ex);
  var results_columns = [];
  for (const [key, value] of Object.entries(result_ex)) {
    results_columns.push(key);
  }
  console.log(results_columns);
  var result = listObjToMultiDim(info[0], results_columns, true);

  console.log(result);
  return result;
}

/**
 * J Status
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection Collection to check status
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string[][]} Returns the status
 */
async function status(auth_key, collection, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  var status = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/status", requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      status.push(response);
    })
    .catch((error) => console.log("error", error));

  let result = [];

  console.log(status);
  status = status[0][collection];
  console.log(status);

  let result_task = [];

  result_task.push(status["Task"]);
  result.push(result_task);

  let result_status = [];

  result_status.push(status["Status"]);
  result = status["Status"];

  let result_description = [];

  result_description.push(status["Description"]);
  result.push(result_description);

  let result_current_step = [];

  result_current_step.push(status["CurrentStep"]);
  result.push(result_current_step);

  let result_total_steps = [];

  result_total_steps.push(status["TotalSteps"]);
  result.push(result_total_steps);

  console.log(result);

  return result;
}

/**
 * J Table Setup - Self Supervised
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection JAI Collection Name
 * @param {string[][]} input_data Table data
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string[][]} Returns the status of the model training
 */
async function fittable(auth_key, collection, input_data, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseFloat(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: myJSON,
  };

  var ans = [];
  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  var setup_params = {};

  setup_params["db_type"] = "SelfSupervised";
  setup_params["hyperparams"] = {
    min_epochs: 500,
    pretraining_ratio: 0.5,
    learning_rate: 0,
    hidden_latent_dim: 128,
  };

  let setup_params_JSON = JSON.stringify(setup_params);

  requestOptions["body"] = setup_params_JSON;

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/setup/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  return ans;
}

/**
 * J Table Setup - Supervised Classification
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection JAI Collection Name
 * @param {string[][]} input_data Table data - including the label
 * @param {string} label_column_name Label (y) column name
 * @param {boolean} [overwrite] Whether to overwrite if a collection with the same name already exists. Default: False
 * @param {boolean} [stratified] Whether to perform stratified train/test split or not - Default: True
 * @param {number} [test_size] % of the data to use for validation and evaluation (test) - Ex: test_size=0.2 means 60% of data for training, 20% for validation, 20% for evaluation - Default: 0.1
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string} Returns the status of the model training
 */
async function fitclassification(
  auth_key,
  collection,
  input_data,
  label_column_name,
  overwrite,
  stratified,
  test_size,
  env
) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  if (stratified === null) {
    stratified = true;
  }

  let split_type = "random";

  if (stratified) {
    split_type = "stratified";
  }

  if (test_size === null) {
    test_size = 0.1;
  }

  if (overwrite === null) {
    overwrite = false;
  }

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseFloat(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
  };

  var ans = [];

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: myJSON,
  };

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  var setup_params = {};

  setup_params["db_type"] = "Supervised";
  setup_params["label"] = {
    task: "metric_classification",
    label_name: label_column_name,
  };
  setup_params["split"] = {
    type: split_type,
    split_column: label_column_name,
    test_size: test_size,
  };
  setup_params["cat_process "] = {
    embedding_dim: 64,
  };
  setup_params["hyperparams"] = {
    min_epochs: 500,
    pretraining_ratio: 0.1,
    learning_rate: 0.0003,
  };

  let setup_params_JSON = JSON.stringify(setup_params);

  requestOptions["body"] = setup_params_JSON;

  // eslint-disable-next-line no-undef
  await fetch(
    "https://mycelia.azure-api.net/setup/" + collection + "?overwrite=" + overwrite.toString(),
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  return "SETUP OK";
}

/**
 * J Table Setup - Supervised Regression
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection JAI Collection Name
 * @param {string[][]} input_data Table data - including the label
 * @param {string} label_column_name Label (y) column name
 * @param {boolean} [overwrite] Whether to overwrite if a collection with the same name already exists. Default: False
 * @param {number} [test_size] % of the data to use for validation and evaluation (test) - Ex: test_size=0.2 means 60% of data for training, 20% for validation, 20% for evaluation - Default: 0.1
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string} Returns the status of the model training
 */
async function fitregression(auth_key, collection, input_data, label_column_name, overwrite, test_size, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  if (test_size === null) {
    test_size = 0.1;
  }

  if (overwrite === null) {
    overwrite = false;
  }

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseFloat(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
  };

  var ans = [];

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: myJSON,
  };

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  var setup_params = {};

  setup_params["db_type"] = "Supervised";
  setup_params["label"] = {
    task: "regression",
    label_name: label_column_name,
  };
  setup_params["split"] = {
    test_size: test_size,
  };
  setup_params["cat_process "] = {
    embedding_dim: 64,
  };
  setup_params["hyperparams"] = {
    min_epochs: 500,
    learning_rate: 0.0003,
    decoder_layer: "2L_BN",
    dropout_rate: 0,
  };

  let setup_params_JSON = JSON.stringify(setup_params);

  requestOptions["body"] = setup_params_JSON;

  // eslint-disable-next-line no-undef
  await fetch(
    "https://mycelia.azure-api.net/setup/" + collection + "?overwrite=" + overwrite.toString(),
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  return "SETUP OK";
}

/**
 * J Table Setup - Supervised Forecast
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection JAI Collection Name
 * @param {string[][]} input_data Table data - including the label
 * @param {string} label_column_name Label (y) column name
 * @param {string} date_column_name Date column name
 * @param {boolean} [overwrite] Whether to overwrite if a collection with the same name already exists. Default: False
 * @param {number} [test_size] % of the data to use for validation and evaluation (test) - Ex: test_size=0.2 means 60% of data for training, 20% for validation, 20% for evaluation - Default: 0.1
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string} Returns the status of the model training
 */
async function fitforecast(
  auth_key,
  collection,
  input_data,
  label_column_name,
  date_column,
  overwrite,
  test_size,
  env
) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  if (test_size === null) {
    test_size = 0.1;
  }

  if (overwrite === null) {
    overwrite = false;
  }

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseFloat(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);

  console.log(myJSON);

  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
  };

  var ans = [];

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: myJSON,
  };

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  var setup_params = {};

  setup_params["db_type"] = "Supervised";
  setup_params["label"] = {
    task: "regression",
    label_name: label_column_name,
    regression_scaler: "log1p+standard",
  };
  setup_params["split"] = {
    test_size: test_size,
    type: "sequential",
    split_column: date_column,
  };
  setup_params["cat_process "] = {
    embedding_dim: 64,
  };
  setup_params["hyperparams"] = {
    min_epochs: 500,
    learning_rate: 0.0003,
    decoder_layer: "2L_BN",
    dropout_rate: 0,
  };

  let setup_params_JSON = JSON.stringify(setup_params);

  requestOptions["body"] = setup_params_JSON;

  // eslint-disable-next-line no-undef
  await fetch(
    "https://mycelia.azure-api.net/setup/" + collection + "?overwrite=" + overwrite.toString(),
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  return "SETUP OK";
}

/**
 * J Table Setup - Create Text Representations
 * @customfunction
 * @param {string} auth_key JAI Auth Key
 * @param {string} collection JAI Collection Name
 * @param {string[][]} input_data Text data, including an id column
 * @param {string} [nlp_model] NLP Model - any model from huggingface model hub. Default: "sentence-transformers/all-mpnet-base-v2"
 * @param {boolean} [overwrite] Whether to overwrite if a collection with the same name already exists. Default: False
 * @param {string} [env] Valid JAI Environment for the inserted Auth Key
 * @returns {string} Returns the status of the model training
 */
async function fittext(auth_key, collection, input_data, nlp_model, overwrite, env) {
  if (env === null) {
    env = "default";
  }
  var myHeaders = new Headers();
  myHeaders.append("Auth", auth_key);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("environment", env);

  if (nlp_model === null) {
    nlp_model = "sentence-transformers/all-mpnet-base-v2";
  }

  if (overwrite === null) {
    overwrite = false;
  }

  let input_list = [];
  // every line
  for (let row = 0; row < input_data.length; row++) {
    if (row > 0) {
      // every column
      var obj = {};
      for (let col = 0; col < input_data[0].length; col++) {
        console.log(input_data[row][col]);
        let value = tryParseFloat(input_data[row][col], input_data[row][col]);
        obj[input_data[0][col]] = value;
      }
      input_list.push(obj);
    }
  }
  console.log(input_list);
  var myJSON = JSON.stringify(input_list);
  var myMongoJSON = {};

  myMongoJSON["dataSource"] = "jozzacluster";
  myMongoJSON["database"] = "jai";
  myMongoJSON["collection"] = collection;
  myMongoJSON["documents"] = myJSON;

  console.log(myJSON);

  var requestOptions = {
    method: "DELETE",
    headers: myHeaders,
  };

  var ans = [];

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: myJSON,
  };

  // eslint-disable-next-line no-undef
  await fetch("https://mycelia.azure-api.net/data/" + collection, requestOptions)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  var setup_params = {};

  setup_params["db_type"] = "Text";

  setup_params["hyperparams"] = {
    nlp_model: nlp_model,
  };

  let setup_params_JSON = JSON.stringify(setup_params);

  requestOptions["body"] = setup_params_JSON;

  // eslint-disable-next-line no-undef
  await fetch(
    "https://mycelia.azure-api.net/setup/" + collection + "?overwrite=" + overwrite.toString(),
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      ans.push(response);
    })
    .catch((error) => console.log("error", error));

  return "SETUP OK";
}
