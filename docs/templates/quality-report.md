# 模板库质量报告

> 由 `scripts/template-scan.mjs` 生成，时间：2026/9/14 21:23:31
> 口径：`packages/engine/templates/` 下 736 个模板（存在 `template.yaml`/`template.json` 的顶层目录），
> 与 `TemplateRegistry.scan()` 的加载统计一致。I/O 判定要求 `inputs` 与 `outputs` 同时声明。

## 汇总

| 检查项 | 缺失数 | 占比 |
|---|---|---|
| 缺 `version` 字段 | 0 | 0.0% |
| `version` 非语义化 | 0 | 0.0% |
| 缺 `dependencies` 声明 | 0 | 0.0% |
| `dependencies` 为空列表 | 283 | 38.5% |
| 缺 `inputs`+`outputs` 声明 | 0 | 0.0% |
| 缺 `README.md` | 0 | 0.0% |

## 明细

### 缺 version

_（无）_

### version 非语义化

_（无）_

### 缺 dependencies

_（无）_

### dependencies 为空列表

共 283 个：

- `comm_ble_central`
- `comm_ble_peripheral`
- `comm_espnnow`
- `comm_http_server`
- `comm_lora`
- `comm_modbus_master`
- `comm_modbus_slave`
- `comm_mqtt_client`
- `comm_nrf24`
- `comm_websocket`
- `common`
- `devops_ansible_deploy`
- `devops_backup`
- `devops_ci_pipeline`
- `devops_docker_ansys`
- `devops_docker_matlab`
- `devops_docker_px4`
- `devops_docker_ros2`
- `devops_k8s_ros2`
- `devops_logging`
- `devops_monitoring`
- `embedded_adc_driver`
- `embedded_can_driver`
- `embedded_dma_driver`
- `embedded_gpio_driver`
- `embedded_i2c_driver`
- `embedded_pwm_driver`
- `embedded_spi_driver`
- `embedded_timer_driver`
- `embedded_uart_driver`
- `embedded_watchdog`
- `iot_aws_iot`
- `iot_azure_iot`
- `iot_esphome`
- `iot_firebase`
- `iot_gcp_iot`
- `iot_home_assistant`
- `iot_mqtt_sensor`
- `iot_node_red`
- `iot_tasmota`
- `iot_thingsboard`
- `matlab`
- `matlab_ad_adaptive_cruise`
- `matlab_ad_emergency_brake`
- `matlab_ad_lane_detect`
- `matlab_ad_lane_keeping`
- `matlab_ad_map_localization`
- `matlab_ad_motion_ctrl`
- `matlab_ad_object_detect`
- `matlab_ad_parking`
- `matlab_ad_path_planning`
- `matlab_ad_perception`
- `matlab_aero_aero_coeff`
- `matlab_aero_atmosphere`
- `matlab_aero_attitude`
- `matlab_aero_drag`
- `matlab_aero_guidance`
- `matlab_aero_lift`
- `matlab_aero_orbit`
- `matlab_aero_propulsion`
- `matlab_aero_stability`
- `matlab_aero_trajectory`
- `matlab_audio_beamform`
- `matlab_audio_echo_cancel`
- `matlab_audio_music_trans`
- `matlab_audio_noise_reduce`
- `matlab_audio_pitch_detect`
- `matlab_audio_source_sep`
- `matlab_audio_spectral_est`
- `matlab_audio_time_stretch`
- `matlab_audio_voice_recog`
- `matlab_audio_warp`
- `matlab_comm_channel_model`
- `matlab_comm_coding`
- `matlab_comm_demodulation`
- `matlab_comm_detection`
- `matlab_comm_equalizer`
- `matlab_comm_error_correction`
- `matlab_comm_modulation`
- `matlab_comm_ofdm`
- `matlab_comm_spread_spectrum`
- `matlab_comm_sync`
- `matlab_control_bode`
- `matlab_control_frequency_response`
- `matlab_control_kalman`
- `matlab_control_lqr`
- `matlab_control_nyquist`
- `matlab_control_pid_tune`
- `matlab_control_root_locus`
- `matlab_control_state_space`
- `matlab_control_transfer_func`
- `matlab_data_clustering`
- `matlab_data_curve_fit`
- `matlab_data_import_export`
- `matlab_data_interpolation`
- `matlab_data_normalization`
- `matlab_data_outlier_detect`
- `matlab_data_principal_component`
- `matlab_data_regression`
- `matlab_data_smoothing`
- `matlab_data_statistical`
- `matlab_embed_coder_gen`
- `matlab_embed_deploy`
- `matlab_embed_doc_gen`
- `matlab_embed_ert`
- `matlab_embed_fixed_point`
- `matlab_embed_hdl_gen`
- `matlab_embed_mex`
- `matlab_embed_profile`
- `matlab_embed_stateflow`
- `matlab_embed_test_gen`
- `matlab_fin_arima`
- `matlab_fin_asset_pric`
- `matlab_fin_backtest`
- `matlab_fin_credit_score`
- `matlab_fin_derivatives`
- `matlab_fin_option_pric`
- `matlab_fin_portfolio`
- `matlab_fin_risk_model`
- `matlab_fin_time_series`
- `matlab_fin_volatility`
- `matlab_fusion_bundle_adj`
- `matlab_fusion_ekf`
- `matlab_fusion_feature_match`
- `matlab_fusion_imu_gps`
- `matlab_fusion_lidar_camera`
- `matlab_fusion_multi_sensor`
- `matlab_fusion_particle`
- `matlab_fusion_radar`
- `matlab_fusion_slam`
- `matlab_fusion_ukf`
- `matlab_geo_contour`
- `matlab_geo_georef`
- `matlab_geo_gis`
- `matlab_geo_gps`
- `matlab_geo_kriging`
- `matlab_geo_projection`
- `matlab_geo_slope_analysis`
- `matlab_geo_terrain_model`
- `matlab_geo_viewshed`
- `matlab_geo_watershed`
- `matlab_image_color_convert`
- `matlab_image_edge_detection`
- `matlab_image_filter`
- `matlab_image_histogram`
- `matlab_image_hough`
- `matlab_image_morphology`
- `matlab_image_segmentation`
- `matlab_image_template_match`
- `matlab_image_transform`
- `matlab_image_watershed`
- `matlab_mech_fatigue`
- `matlab_mech_fluid`
- `matlab_mech_heat_transfer`
- `matlab_mech_hydraulic`
- `matlab_mech_linkage`
- `matlab_mech_material`
- `matlab_mech_modal`
- `matlab_mech_structural`
- `matlab_mech_tolerance`
- `matlab_mech_vibration`
- `matlab_med_biomechanics`
- `matlab_med_blood_flow`
- `matlab_med_ct_process`
- `matlab_med_ecg_analysis`
- `matlab_med_eeg_analysis`
- `matlab_med_heart_model`
- `matlab_med_mri_process`
- `matlab_med_neural_decode`
- `matlab_med_pharma_model`
- `matlab_med_segmentation`
- `matlab_ml_anomaly_detect`
- `matlab_ml_classification`
- `matlab_ml_cross_valid`
- `matlab_ml_deep_learn`
- `matlab_ml_feature_eng`
- `matlab_ml_model_select`
- `matlab_ml_neural_net`
- `matlab_ml_regression`
- `matlab_ml_reinforcement`
- `matlab_ml_transfer_learn`
- `matlab_numerical_differentiation`
- `matlab_numerical_eigenvalue`
- `matlab_numerical_integration`
- `matlab_numerical_linalg`
- `matlab_numerical_lsq`
- `matlab_numerical_monte_carlo`
- `matlab_numerical_ode`
- `matlab_numerical_pde`
- `matlab_numerical_root_find`
- `matlab_numerical_spline`
- `matlab_optimize_constrained`
- `matlab_optimize_convex`
- `matlab_optimize_ga`
- `matlab_optimize_gradient`
- `matlab_optimize_linear_program`
- `matlab_optimize_multi_objective`
- `matlab_optimize_newton`
- `matlab_optimize_pso`
- `matlab_optimize_quadratic_program`
- `matlab_optimize_simulated_annealing`
- `matlab_power_battery_model`
- `matlab_power_converter`
- `matlab_power_grid`
- `matlab_power_inverter`
- `matlab_power_load_flow`
- `matlab_power_motor_ctrl`
- `matlab_power_pfc`
- `matlab_power_pq_analysis`
- `matlab_power_solar_panel`
- `matlab_power_wind_turbine`
- `matlab_robot_dynamics`
- `matlab_robot_fk`
- `matlab_robot_ik`
- `matlab_robot_jacobian`
- `matlab_robot_localization`
- `matlab_robot_obstacle_avoid`
- `matlab_robot_path_plan`
- `matlab_robot_slam`
- `matlab_robot_trajectory`
- `matlab_robot_visual_servo`
- `matlab_signal_convolution`
- `matlab_signal_correlation`
- `matlab_signal_envelope`
- `matlab_signal_filter_design`
- `matlab_signal_hilbert`
- `matlab_signal_notch_filter`
- `matlab_signal_power_spectrum`
- `matlab_signal_resample`
- `matlab_signal_wavelet`
- `matlab_sim_3d_viz`
- `matlab_sim_animation`
- `matlab_sim_hardware_in_loop`
- `matlab_sim_harness`
- `matlab_sim_log_parse`
- `matlab_sim_monte_carlo_sim`
- `matlab_sim_quadrotor`
- `matlab_sim_report_gen`
- `matlab_sim_robot_arm`
- `matlab_sim_vehicle`
- `opencv`
- `ros`
- `rtos_event_group`
- `rtos_interrupt`
- `rtos_memory_pool`
- `rtos_power_mgmt`
- `rtos_queue`
- `rtos_semaphore`
- `rtos_task_create`
- `rtos_task_priority`
- `rtos_timer`
- `rtos_trace`
- `simulink_adaptive_control`
- `simulink_battery_management`
- `simulink_channel_model`
- `simulink_correlation`
- `simulink_dc_dc_converter`
- `simulink_fft_analysis`
- `simulink_filter_design`
- `simulink_fuzzy_pid`
- `simulink_gain_scheduling`
- `simulink_grid_tie`
- `simulink_inverter_pwm`
- `simulink_lead_lag`
- `simulink_lqr_control`
- `simulink_modulation`
- `simulink_motor_foc`
- `simulink_mpc_control`
- `simulink_notch_filter`
- `simulink_observer`
- `simulink_ofdm_system`
- `simulink_pfc_circuit`
- `simulink_pid_control`
- `simulink_power_quality`
- `simulink_radar_system`
- `simulink_robust_control`
- `simulink_solar_mppt`
- `simulink_spectral_analyzer`
- `simulink_spread_spectrum`
- `simulink_state_feedback`
- `simulink_ups_system`
- `simulink_wind_turbine`
- `stm32`

### 缺 inputs+outputs

_（无）_

### 缺 README.md

_（无）_
