'use strict';

/**
 * @ngdoc function
 * @name angularGanttDemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularGanttDemoApp
 */
angular.module('angularGanttDemoApp')
    .controller('MainCtrl', ['$scope', '$timeout', '$log', 'ganttUtils', 'GanttObjectModel', 'Sample', 'ganttMouseOffset', 'ganttDebounce', 'moment','$http', function($scope, $timeout, $log, utils, ObjectModel, Sample, mouseOffset, debounce, moment,$http) {
        var objectModel;
        var dataToRemove;

	

        // Event handler
        var logScrollEvent = function(left, date, direction) {
            if (date !== undefined) {
                $log.info('[Event] api.on.scroll: ' + left + ', ' + (date === undefined ? 'undefined' : date.format()) + ', ' + direction);
            }
        };

        // Event handler
        var logDataEvent = function(eventName) {
            $log.info('[Event] ' + eventName);
        };

        // Event handler
        var logTaskEvent = function(eventName, task) {
            $log.info('[Event] ' + eventName + ': ' + task.model.name);
        };

        // Event handler
        var logRowEvent = function(eventName, row) {
            $log.info('[Event] ' + eventName + ': ' + row.model.name);
        };

        // Event handler
        var logTimespanEvent = function(eventName, timespan) {
            $log.info('[Event] ' + eventName + ': ' + timespan.model.name);
        };

        // Event handler
        var logLabelsEvent = function(eventName, width) {
            $log.info('[Event] ' + eventName + ': ' + width);
        };

        // Event handler
        var logColumnsGenerateEvent = function(columns, headers) {
            $log.info('[Event] ' + 'columns.on.generate' + ': ' + columns.length + ' column(s), ' + headers.length + ' header(s)');
        };

        // Event handler
        var logRowsFilterEvent = function(rows, filteredRows) {
            $log.info('[Event] rows.on.filter: ' + filteredRows.length + '/' + rows.length + ' rows displayed.');
        };

        // Event handler
        var logTasksFilterEvent = function(tasks, filteredTasks) {
            $log.info('[Event] tasks.on.filter: ' + filteredTasks.length + '/' + tasks.length + ' tasks displayed.');
        };

        // Event handler
        var logReadyEvent = function() {
            $log.info('[Event] core.on.ready');
        };

        // Event utility function
        var addEventName = function(eventName, func) {
            return function(data) {
                return func(eventName, data);
            };
        };

        // angular-gantt options
        $scope.options = {
            mode: 'custom',
            scale: 'day',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: false,
            width: false,
            zoom: 1,
            columns: ['model.name', 'from', 'to'],
            treeTableColumns: ['from', 'to'],
            columnsHeaders: {'model.name' : 'Name', 'from': 'From', 'to': 'To'},
            columnsClasses: {'model.name' : 'gantt-column-name', 'from': 'gantt-column-from', 'to': 'gantt-column-to'},
            columnsFormatters: {
                'from': function(from) {
                    return from !== undefined ? from.format('lll') : undefined;
                },
                'to': function(to) {
                    return to !== undefined ? to.format('lll') : undefined;
                }
            },
            treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            columnsHeaderContents: {
                'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
                'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
                'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            fromDate: moment(null),
            toDate: undefined,
            rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
            taskContent : '<i class="fa fa-tasks"></i> {{task.model.name}}',
            allowSideResizing: true,
            labelsEnabled: true,
            currentDate: 'line',
            currentDateValue: new Date(2013, 9, 23, 11, 20, 0),
            draw: false,
            readOnly: false,
            groupDisplayMode: 'group',
            filterTask: '',
            filterRow: '',
            timeFrames: {
                'day': {
                    start: moment('8:00', 'HH:mm'),
                    end: moment('20:00', 'HH:mm'),
                    color: '#ACFFA3',
                    working: true,
                    default: true
                },
                'noon': {
                    start: moment('12:00', 'HH:mm'),
                    end: moment('13:30', 'HH:mm'),
                    working: false,
                    default: true
                },
                'closed': {
                    working: false,
                    default: true
                },
                'weekend': {
                    working: false
                },
                'holiday': {
                    working: false,
                    color: 'red',
                    classes: ['gantt-timeframe-holiday']
                }
            },
            dateFrames: {
                'weekend': {
                    evaluator: function(date) {
                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                },
                '11-november': {
                    evaluator: function(date) {
                        return date.month() === 10 && date.date() === 11;
                    },
                    targets: ['holiday']
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible',
            columnMagnet: '15 minutes',
            timeFramesMagnet: true,
            dependencies: {
                enabled: true,
                conflictChecker: true
            },
            targetDataAddRowIndex: undefined,
            canDraw: function(event) {
                var isLeftMouseButton = event.button === 0 || event.button === 1;
                return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
            },
            drawTaskFactory: function() {
                return {
                    id: utils.randomUuid(),  // Unique id of the task.
                    name: 'Drawn task', // Name shown on top of each task.
                    color: '#AA8833' // Color of the task in HEX format (Optional).
                };
            },
            api: function(api) {
                // API Object is used to control methods and events from angular-gantt.
                $scope.api = api;

                api.core.on.ready($scope, function() {
                    // Log various events to console
                    api.scroll.on.scroll($scope, logScrollEvent);
                    api.core.on.ready($scope, logReadyEvent);

                    api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
                    api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
                    api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));
                    api.data.on.change($scope, addEventName('data.on.change', logDataEvent));

                    api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
                    api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
                    api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
                    api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

                    if (api.tasks.on.moveBegin) {
                        api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
                        //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
                        api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

                        api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
                        //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
                        api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
                    }

                    if (api.tasks.on.drawBegin) {
                        api.tasks.on.drawBegin($scope, addEventName('tasks.on.drawBegin', logTaskEvent));
                        //api.tasks.on.draw($scope, addEventName('tasks.on.draw', logTaskEvent));
                        api.tasks.on.drawEnd($scope, addEventName('tasks.on.drawEnd', logTaskEvent));
                    }

                    api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
                    api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
                    api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
                    api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

                    api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
                    //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
                    api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

                    api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
                    api.columns.on.generate($scope, logColumnsGenerateEvent);

                    api.rows.on.filter($scope, logRowsFilterEvent);
                    api.tasks.on.filter($scope, logTasksFilterEvent);

                    api.data.on.change($scope, function(newData) {
                        if (dataToRemove === undefined) {
                            dataToRemove = [
                               
                            ];
                        }
                    });

                    // When gantt is ready, load data.
                    // `data` attribute could have been used too.
                    $scope.load();

                    // Add some DOM events
                    api.directives.on.new($scope, function(directiveName, directiveScope, element) {
                        if (directiveName === 'ganttTask') {
                            element.bind('click', function(event) {
                                event.stopPropagation();
                                logTaskEvent('task-click', directiveScope.task);
                            });
                            element.bind('mousedown touchstart', function(event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.task.row.model;
                                if (directiveScope.task.originalModel !== undefined) {
                                    $scope.live.task = directiveScope.task.originalModel;
                                } else {
                                    $scope.live.task = directiveScope.task.model;
                                }
                                $scope.$digest();
                            });
							
							  element.on('contextmenu', function(event){
								  //event.preventDefault();
								  //alert('something news');
								});
                        } else if (directiveName === 'ganttRow') {
                            element.bind('click', function(event) {
                                event.stopPropagation();
                                logRowEvent('row-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function(event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRowLabel') {
                            element.bind('click', function() {
                                logRowEvent('row-label-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function() {
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        }
                    });

                    api.tasks.on.rowChange($scope, function(task) {
                        $scope.live.row = task.row.model;
                    });

                    objectModel = new ObjectModel(api);
                });
            }
        };

        $scope.handleTaskIconClick = function(taskModel) {
            alert('Icon from ' + taskModel.name + ' task has been clicked.');
        };

        $scope.handleRowIconClick = function(rowModel) {
            alert('Icon from ' + rowModel.name + ' row has been clicked.');
        };

        $scope.expandAll = function() {
            $scope.api.tree.expandAll();
        };

        $scope.collapseAll = function() {
            $scope.api.tree.collapseAll();
        };

        $scope.$watch('options.sideMode', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.api.side.setWidth(undefined);
                $timeout(function() {
                    $scope.api.columns.refresh();
                });
            }
        });

        $scope.canAutoWidth = function(scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            }
            return true;
        };

        $scope.getColumnWidth = function(widthEnabled, scale, zoom) {
            if (!widthEnabled && $scope.canAutoWidth(scale)) {
                return undefined;
            }

            if (scale.match(/.*?week.*?/)) {
                return 150 * zoom;
            }

            if (scale.match(/.*?month.*?/)) {
                return 300 * zoom;
            }

            if (scale.match(/.*?quarter.*?/)) {
                return 500 * zoom;
            }

            if (scale.match(/.*?year.*?/)) {
                return 800 * zoom;
            }

            return 40 * zoom;
        };

        // Reload data action
        $scope.load = function() {
            $scope.data = getSampleData();
            dataToRemove = undefined;

            $scope.timespans = Sample.getSampleTimespans();
        };
 
         var getSampleData = function() {
			 
			 var input='{"ACFTS":[{"4":["A320","D-NLPD"]},{"1":["A320","D-NLPA"]},{"2":["A320","D-NLPB"]},{"3":["A320","D-NLPC"]},{"5":["E190","D-EKLA"]},{"6":["E190","D-EKLB"]},{"7":["E190","D-EKLC"]},{"8":["E190","D-EKLD"]},{"9":["CRJ700","D-ICKA"]},{"26":["CRJ700","D-ICKQ"]},{"21":["CRJ700","D-ICKL"]},{"16":["CRJ700","D-ICKG"]},{"32":["CRJ700","D-ICKW"]},{"11":["CRJ700","D-ICKB"]},{"27":["CRJ700","D-ICKR"]},{"22":["CRJ700","D-ICKM"]},{"17":["CRJ700","D-ICKH"]},{"12":["CRJ700","D-ICKC"]},{"28":["CRJ700","D-ICKS"]},{"23":["CRJ700","D-ICKN"]},{"18":["CRJ700","D-ICKI"]},{"13":["CRJ700","D-ICKD"]},{"29":["CRJ700","D-ICKT"]},{"24":["CRJ700","D-ICKO"]},{"19":["CRJ700","D-ICKJ"]},{"14":["CRJ700","D-ICKE"]},{"30":["CRJ700","D-ICKU"]},{"25":["CRJ700","D-ICKP"]},{"20":["CRJ700","D-ICKK"]},{"15":["CRJ700","D-ICKF"]},{"31":["CRJ700","D-ICKV"]}],"FLTS":[{"ac_id":"5","fn_number":"AOG","dep_ap_sched":"","arr_ap_sched":"","dep_ap_act":"221","arr_ap_act":"221","dep_sched_dt":"","arr_sched_dt":"","dep_act_dt":"1463338620","arr_act_dt":1473717600,"main_color":"rgb(0,0,255)","act_color":"rgb(255,128,0)"},{"ac_id":"17","flt_id":null,"fn_number":"TST1","dep_ap_sched":"DUS","arr_ap_sched":"GWT","dep_ap_act":"DUS","arr_ap_act":"GWT","dep_sched_dt":"1473537600","arr_sched_dt":"1473541200","dep_act_dt":"1473537600","arr_act_dt":"1473541200","main_color":"rgb(0,0,255)","act_color":"rgb(0,153,0)"},{"ac_id":"17","flt_id":null,"fn_number":"TST2","dep_ap_sched":"GWT","arr_ap_sched":"VIE","dep_ap_act":"GWT","arr_ap_act":"VIE","dep_sched_dt":"1473544800","arr_sched_dt":"1473555600","dep_act_dt":"1473544800","arr_act_dt":"1473555600","main_color":"rgb(0,0,255)","act_color":"rgb(0,153,0)"}]}';
			var inputObj=JSON.parse(input);
			var rowCont=inputObj.ACFTS;
			var taskCont=inputObj.FLTS;
			var objRowList=[];
			var objRow=new Object();
			var taskobjRow=new Object();
			var map = new Object(); // or var map = {};
			

			function getMap(k) {
				return map[k];
			}

				for(var accId in rowCont){
					objRow=new Object();
					for(var key in rowCont[accId]){
						objRow.accId=key;
						objRow.name=rowCont[accId][key][0];
						objRow.subName=rowCont[accId][key][1];
						objRow.taskEvent=[];
						//objRow.flt_id="";
						//objRow.fn_number="";
						//objRow.dep_ap_sched="";
						//sobjRow.arr_ap_sched="";
						map[key] = objRow;	
					}
					
				
				
					
				}
				
			for(var flights in taskCont){
					taskobjRow=new Object();
					for(var key in taskCont[flights]){
						
							
							//taskobjRow.flt_id=taskCont[flights]['flt_id'];
							//taskobjRow.fn_number=taskCont[flights]['fn_number'];
							//taskobjRow.dep_ap_sched=taskCont[flights]['dep_ap_sched'];
							//taskobjRow.arr_ap_sched=taskCont[flights]['arr_ap_sched'];
							taskobjRow[key]=taskCont[flights][key];
							
									
							
							//map[taskCont[flights]['ac_id']].task[count]=
							//map[taskCont[flights]['ac_id']].flt_id=taskCont[flights]['flt_id'];
							//map[taskCont[flights]['ac_id']].fn_number=taskCont[flights][fn_number];
							//map[taskCont[flights]['ac_id'].dep_ap_sched=taskCont[flights][dep_ap_sched];
							//map[taskCont[flights]['ac_id'].arr_ap_sched=taskCont[flights][arr_ap_sched];
							
						
					}
					
				map[taskCont[flights]['ac_id']].taskEvent.push(taskobjRow);
					
					
				}

			 console.log(map);
			 
			var finalSample=[];
			var rowFinalObj={};
			for(var flights in taskCont){
				
				rowFinalObj.name=map[taskCont[flights]['ac_id']].subName;
				finalSample.push(rowFinalObj);
			}
			  console.log(finalSample);
			  return finalSample;
			/*$http.get("http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php")
						.then(function(response) {
							console.log(response.data);
						  return response.data;
						});  
						
						
						$http({
    method: 'POST',
    url: '/API/authenticate',
    data: 'username=' + username + '&password=' + password + '&email=' + email,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Login-Ajax-call": 'true'
    }
}).then(function(response) {
    if (response.data == 'ok') {
        // success
    } else {
        // failed
    }
});*/
						
						/*$http({
							method: 'JSONP',
							url: 'http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php',
							callback=JSON_CALLBACK
						}).then(function(response) {
							console.log('ok');
						});
        };
		 $http.jsonp("http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php?callback=JSON_CALLBACK")
            .success(function (data) {
                $scope.realTimeData = JSON_CALLBACK (data);
                console.log($scope.realTimeData)
            });*/
				
			/*$http({
				method: 'JSONP',
				url: 'http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php'
				
			}).then(function(response) {
							alert('ok');
						});*/
							/*$http.jsonp("http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php?callback=JSON_CALLBACK")
            .success(function (data) {
               /* $scope.realTimeData = JSON_CALLBACK (data);
                console.log($scope.realTimeData)
				alert('data');
            });*/
						/*$http.jsonp("http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php?callback=JSON_CALLBACK")
            .success(function (data) {
               /* $scope.realTimeData = JSON_CALLBACK (data);
                console.log($scope.realTimeData)
				alert('data');
            });*/
			//$http.get("http://www.sigmo-databases.com/testplatform/moc/pages/opscontrol_json.php")
            //.success(function (data) {
            //  var total = $.parseJSON(data);
			//	alert(total);
           // });
			     //    console.log('parth');
				 
		
			
			 };
        $scope.reload = function() {
            $scope.load();
        };

        // Remove data action
        $scope.remove = function() {
            $scope.api.data.remove(dataToRemove);
            $scope.api.dependencies.refresh();
        };

        // Clear data action
        $scope.clear = function() {
            $scope.data = [];
        };

        // Add data to target row index
        $scope.addOverlapTaskToTargetRowIndex = function() {
            var targetDataAddRowIndex = parseInt($scope.options.targetDataAddRowIndex);

            if (targetDataAddRowIndex) {
                var targetRow = $scope.data[$scope.options.targetDataAddRowIndex];

                if (targetRow && targetRow.tasks && targetRow.tasks.length > 0) {
                    var firstTaskInRow = targetRow.tasks[0];
                    var copiedColor = firstTaskInRow.color;
                    var firstTaskEndDate = firstTaskInRow.to.toDate();
                    var overlappingFromDate = new Date(firstTaskEndDate);

                    overlappingFromDate.setDate(overlappingFromDate.getDate() - 1);

                    var overlappingToDate = new Date(overlappingFromDate);

                    overlappingToDate.setDate(overlappingToDate.getDate() + 7);

                    targetRow.tasks.push({
                        'name': 'Overlapping',
                        'from': overlappingFromDate,
                        'to': overlappingToDate,
                        'color': copiedColor
                    });
                }
            }
        };


        // Visual two way binding.
        $scope.live = {};

        var debounceValue = 1000;

        var listenTaskJson = debounce(function(taskJson) {
            if (taskJson !== undefined) {
                var task = angular.fromJson(taskJson);
                objectModel.cleanTask(task);
                var model = $scope.live.task;
                angular.extend(model, task);
            }
        }, debounceValue);
        $scope.$watch('live.taskJson', listenTaskJson);

        var listenRowJson = debounce(function(rowJson) {
            if (rowJson !== undefined) {
                var row = angular.fromJson(rowJson);
                objectModel.cleanRow(row);
                var tasks = row.tasks;

                delete row.tasks;
                delete row.drawTask;

                var rowModel = $scope.live.row;

                angular.extend(rowModel, row);

                var newTasks = {};
                var i, l;

                if (tasks !== undefined) {
                    for (i = 0, l = tasks.length; i < l; i++) {
                        objectModel.cleanTask(tasks[i]);
                    }

                    for (i = 0, l = tasks.length; i < l; i++) {
                        newTasks[tasks[i].id] = tasks[i];
                    }

                    if (rowModel.tasks === undefined) {
                        rowModel.tasks = [];
                    }
                    for (i = rowModel.tasks.length - 1; i >= 0; i--) {
                        var existingTask = rowModel.tasks[i];
                        var newTask = newTasks[existingTask.id];
                        if (newTask === undefined) {
                            rowModel.tasks.splice(i, 1);
                        } else {
                            objectModel.cleanTask(newTask);
                            angular.extend(existingTask, newTask);
                            delete newTasks[existingTask.id];
                        }
                    }
                } else {
                    delete rowModel.tasks;
                }

                angular.forEach(newTasks, function(newTask) {
                    rowModel.tasks.push(newTask);
                });
            }
        }, debounceValue);
        $scope.$watch('live.rowJson', listenRowJson);

        $scope.$watchCollection('live.task', function(task) {
            $scope.live.taskJson = angular.toJson(task, true);
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
        });

        $scope.$watchCollection('live.row', function(row) {
            $scope.live.rowJson = angular.toJson(row, true);
            if (row !== undefined && row.tasks !== undefined && row.tasks.indexOf($scope.live.task) < 0) {
                $scope.live.task = row.tasks[0];
            }
        });

        $scope.$watchCollection('live.row.tasks', function() {
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
        });

    }]);